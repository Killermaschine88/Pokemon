const { getStorageRow } = require("../functions/generatorFunctions");
const { generateRandomPokemon, pokemonFound } = require("../functions/pokemonFunctions");
const { getOffset, handleMovement } = require("../functions/mapFunctions");
const { displayPokemon, getEmoji } = require("../functions/utilFunctions");
const { MessageEmbed } = require("discord.js");
const { rows } = require("../constants/discord");
const { playerMap } = require("../constants/map");

class GameMap {
  constructor(existingSave) {
    if (existingSave) {
      this.profile = existingSave.profile;
      this.map = playerMap;
      this.pos = existingSave.game.pos;
      this.lastMove = existingSave.game.lastMove;
      this.lastField = existingSave.game.lastField;
      this.newField = existingSave.game.newField;
      this.embed = new MessageEmbed().setDescription(this.renderMap());
    } else {
      const map = playerMap;

      const x = (playerMap[0].length / 2).toFixed() - 1;
      const y = (playerMap.length / 2).toFixed() - 1;

      this.map = map;
      this.pos = { x, y };
      this.lastMove = "down";
      console.log(this.pos);
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
    // Place Player
    const x = (map[0].length / 2).toFixed() - 1;
    const y = (map.length / 2).toFixed() - 1;
    map[y][x] = 0; // Player

    // Render Map
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
        return { spawned: true, pokemon: foundPokemon };
      } else {
        return { spawned: false };
      }
    }
  }

  // Setters
  setMessage(message) {
    this.message = message;
    return this;
  }

  setProfileIndex(index) {
    this.profileIndex = index;
    return this;
  }

  setVariables(interaction, collector) {
    this.client = interaction.client;
    this.user = interaction.user;
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

  // Getters
  getProfileData(prop) {
    return prop ? this.profile[prop] : this.profile;
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

  getProfileForSave() {
    let obj = {};
    for (const [key, value] of Object.entries(this)) {
      if (["profile"].includes(key)) obj[key] = value;
    }

    obj["game"] = {
      // Map itself
      pos: this.pos,
      lastMove: this.lastMove,
      lastField: this.lastField || 1,
      newField: this.newField || 1,
    };
    return obj;
  }

  async getPokemonTeamInfo(int, id) {
    const pokemon = this.profile.team[id];
    return displayPokemon(int, pokemon, "deposit", id);
  }

  async getStorageRow(int, id) {
    return getStorageRow(this, int, id);
  }

  async showStoragePokemon(int, id) {
    const split = id.split("_");
    const pokemon = this.profile.storage[split[1]][split[2]];
    return displayPokemon(int, pokemon, "withdraw", id);
  }
}

module.exports = { GameMap };
