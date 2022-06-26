const { getEmoji, getOffset, handleMovement, generateMap, pokemonFound, generateRandomPokemon, returnPokemonStats, getPokemonLevel, returnPokemonMoves } = require("./functions");
const { MessageEmbed } = require("discord.js");
const { rows } = require("./constants");
const { getCurrentProfile } = require("./mongoFunctions");

class GameMap {
  constructor(existingSave) {
    if (existingSave) {
      this.name = existingSave.name;
      this.created = existingSave.created;
      this.team = existingSave.team;
      this.bag = existingSave.bag;
      this.badges = existingSave.badges;
      this.pokedex = existingSave.pokedex;
      this.storage = existingSave.storage;
      this.starterPokemon = existingSave.starterPokemon;
      this.pokemonDollars = existingSave.pokemonDollars;
      this.map = existingSave.game.map;
      this.pos = existingSave.game.pos;
      this.lastMove = existingSave.game.lastMove;
      this.lastField = existingSave.game.lastField;
      this.newField = existingSave.game.newField;
      this.embed = new MessageEmbed().setDescription(this.renderMap());
    } else {
      const width = 50;
      const height = 50;

      const map = generateMap({ width, height });

      const x = (width / 2).toFixed() - 1;
      const y = (height / 2).toFixed() - 1;

      map[y][x] = 0; //Player

      this.map = map;
      this.pos = { x, y };
      this.lastMove = "down";
    }
  }

  getView(distance) {
    const newMap = [];

    for (let y = -distance; y <= distance; y++) {
      if (!newMap[distance + y] || !this.map[this.pos.y + y]) newMap[distance + y] = [];
      for (let x = -distance; x <= distance; x++) {
        if (this.pos.x + x < 0 || !this.map[this.pos.y + y] || !this.map[this.pos.x + x]) {
          newMap[distance + y][distance + x] = 9;
        } else {
          newMap[distance + y][distance + x] = this.map[this.pos.y + y][this.pos.x + x];
        }
      }
    }
    return newMap;
  }

  renderMap(distance = 5) {
    let str = "";
    let map = this.getView(distance);
    for (const row of map) {
      for (const index of row) {
        str += getEmoji(index, false, this.lastMove);
      }
      str += "\n";
    }
    return str;
  }

  movePlayer(id) {
    this.lastMove = id;
    const [x, y] = getOffset(id);
    const returnValue = handleMovement(this, x, y);
    this.map = returnValue.map;
    this.pos = returnValue.pos;
    this.lastField = returnValue.lastField;
    this.newField = returnValue.newField;
    return this;
  }

  updateEmbed() {
    return this.embed.setDescription(this.renderMap());
  }

  async updateMessage() {
    await this.message.edit({ content: null, embeds: [this.updateEmbed()], components: rows });
  }

  pokemonSpawned() {
    if (this.newField === 2) {
      if (pokemonFound()) {
        const foundPokemon = generateRandomPokemon();
      }
    }
  }

  // Setters
  setMessage(message) {
    this.message = message;
    return this
  }

  setProfileIndex(index) {
    this.profileIndex = index;
    return this;
  }

  setVariables(interaction, collector) {
    this.client = interaction.client;
    this.user = interaction.user;
    getCurrentProfile(this.client, this.user, this.profileIndex).then((data) => {
      this.profile = data;
    });
    this.collector = collector;
    return this;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  setStarted() {
    this.started = true;
    return this;
  }

  setStoragePages(obj) {
    this.storagePages = obj;
    return this;
  }

  // Getters
  getProfileData(prop) {
    return prop ? this.profile[prop] : this;
  }

  getMessage() {
    return this.message;
  }

  isStarted() {
    return this.started || false;
  }

  getData(data) {
    return this[data];
  }

  getStoragePage(page) {
    return this.storagePages[page];
  }

  getProfileForSave() {
    let obj = {};
    for (const [key, value] of Object.entries(this)) {
      if (["name", "created", "starterPokemon", "pokemonDollars", "team", "bag", "badges", "pokedex", "storage"].includes(key)) obj[key] = value;
    }

    obj["game"] = {
      // Map itself
      map: this.map,
      pos: this.pos,
      lastMove: this.lastMove,
      lastField: this.lastField || 1,
      newField: this.newField || 1,
    };
    return obj;
  }

  getPokemonTeamInfo(int, id) {
    const pokemon = this.profile.team[id];
    const pokemonEmbed = new MessageEmbed().setTitle(`Team Member info for ${pokemon.name} ${getEmoji(pokemon.name)}`).setDescription(`Level: **${getPokemonLevel(pokemon.xp)}**\nTypes: **${pokemon.types.join(", ")}**`);
    pokemonEmbed.addField("Stats", `${returnPokemonStats(pokemon.stats)}`, true);
    pokemonEmbed.addField("Moves", `${returnPokemonMoves(pokemon.moves)}`, true);

    int.followUp({ embeds: [pokemonEmbed], ephemeral: true });
  }

  // Unused atm
}

module.exports = { GameMap };
