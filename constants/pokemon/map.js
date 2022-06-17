const { getEmoji } = require("./functions");

class GameMap {
  constructor() {
    let gameGrid = Array.from({ length: 1000 }).map(() => []);

    for (const row of gameGrid) {
      while (row.length < 1000) {
        row.push(0);
      }
    }

    const x = (width / 2).toFixed() - 1;
    const y = (height / 2).toFixed() - 1;

    gameGrid[y][x] = 0; //Player

    this.gameGrid = gameGrid;
    this.pos = { x, y };
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

  renderMap(distance) {
    let str = "";
    let map = this.getView(distance);
    for (const row of map) {
      for (const index of row) {
        str += getEmoji(index);
      }
      str += "\n";
    }
    return str;
  }
}

module.exports = { GameMap };
