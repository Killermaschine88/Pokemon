const { emojis } = require("./constants");
const { getRandomNumber } = require("../util/functions");

function getEmoji(name, way = "down") {
  if (name === 0) return emojis[name + way];
  else return emojis[name];
}

function updateEmbed(interaction, Game, embed) {
  embed.setDescription(Game.renderMap());
  interaction.editReply({ embeds: [embed] });
}

function getOffset(id) {
  if (id === "up") return [0, -1]; //x, y
  if (id === "down") return [0, 1];
  if (id === "left") return [-1, 0];
  if (id === "right") return [1, 0];
}

function handleMovement(game, x, y) {
  if (canMove(game, x, y)) {
    game.lastField = game.map[game.pos.y + y][game.pos.x + x]
    game.map[game.pos.y][game.pos.x] = game.lastField === 2 ? 2 : 1; //Place field back after player gone
    game.map[game.pos.y + y][game.pos.x + x] = 0; //Player
    game.pos.y += y;
    game.pos.x += x;
  }
  return game;
}

function canMove(game, x, y) {
  const move = game.map[game.pos.y + y][game.pos.x + x];

  return ![undefined].includes(move);
}

function generateMap({ width, height }) {
  let map = Array.from({ length: height }).map(() => []);
  let mapGenerating = true;
  let x = 0;
  let y = 0;

  while (mapGenerating) {
    const randomNum = getRandomNumber(100, false);

    if (randomNum <= 3) {
      //Grass Chance
      const [fieldWidth, fieldHeight] = getFieldSize();

      let newX = x;
      let newY = y;

      for (let i = 0; i < fieldHeight; i++) {
        for (let j = 0; j < fieldWidth; j++) {
          if (newY + j < width && newX + i < height) map[newY + j][newX + i] = 2;
        }
      }
    } else {
      if (![2].includes(map[y][x])) map[y][x] = 1;
      x++;
      if (x >= width) {
        y++;
        x = 0;
      }
    }

    if (mapFinished(map, width)) mapGenerating = false;
  }
  return map;
}

function mapFinished(map, width) {
  return map.every((arr) => arr.length >= width);
}

function getFieldSize() {
  //Width x Height
  const fields = [
    [5, 5],
    [5, 8],
    [3, 3],
  ];

  return fields[Math.floor(Math.random() * fields.length)];
}

module.exports = { getEmoji, updateEmbed, getOffset, handleMovement, generateMap };
