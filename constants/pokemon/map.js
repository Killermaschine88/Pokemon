const { getEmoji, getOffset, handleMovement } = require("./functions");

class GameMap {
  constructor() {
    const width = 50;
    const height = 50;
    let map = Array.from({ length: height }).map(() => []);

    for (const row of map) {
      while (row.length < width) {
        row.push(1);
      }
    }

    const x = (width / 2).toFixed() - 1;
    const y = (height / 2).toFixed() - 1;

    map[y][x] = 0; //Player

    this.map = map;
    this.pos = { x, y };
    this.lastMove = "down";
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

  renderMap(distance = 3) {
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
  }
}

module.exports = { GameMap };
