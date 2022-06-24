const { getEmoji, getOffset, handleMovement, generateMap, pokemonFound, generateRandomPokemon } = require("./functions");
const { MessageEmbed } = require("discord.js");
const { rows } = require("./constants");

class GameMap {
  constructor(existingSave) {
    if (existingSave) {
      this.map = existingSave.map;
      this.pos = existingSave.pos;
      this.lastMove = existingSave.lastMove;
      this.lastField = existingSave.lastField;
      this.newField = existingSave.newField;
      this.embed = new MessageEmbed(this.embed);
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
      this.embed = new MessageEmbed().setDescription(this.renderMap());
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
        str += getEmoji(index, this.lastMove);
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
  }

  updateEmbed() {
    return this.embed.setDescription(this.renderMap());
  }

  setMessage(message) {
    this.message = message;
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
  setProfileIndex(index) {
    this.index = index;
  }

  setMessage(message) {
    this.message = message;
  }

  setStarted() {
    this.started = true;
  }

  // Getters
  getProfileIndex() {
    return this.index;
  }

  getMessage() {
    return this.message;
  }

  isStarted() {
    return this.started || false;
  }

  getProfile() {
    let obj = {};
    for (const [key, value] of Object.entries(this)) {
      if (["message", "started"].includes(key)) continue;
      obj[key] = value;
    }
    return obj;
  }

  // Unused atm
}

module.exports = { GameMap };
