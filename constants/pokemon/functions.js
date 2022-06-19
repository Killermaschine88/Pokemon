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
    game.map[game.pos.y][game.pos.x] = 1; //Street
    game.map[game.pos.y + y][game.pos.x + x] = 0; //Player
    game.pos.y += y;
    game.pos.x += x;
  }
  return game;
}

function canMove(game, x, y) {
  const move = game.map[game.pos.y + y][game.pos.x + x];

  if ([undefined, 2].includes(move)) return false;
  else return true;
}

//Make working below here so it properly places the fields and shit in planned way

function generateBlock(map, currentX, currentY) {
  const num = getRandomNumber(100);
  if (num > 10) {
    return { singleBlock: true, type: 1 };
  } else {
    [map, currentX, currentY] = placeField(map, currentX, currentY);
    return [map, currentX, currentY];
  }
}

function placeField(map, currentX, currentY) {
  const size = getRandomNumber(15);
  let temp = 0;
  let i = 0;
  while (i < size) {
    i++;
    if (temp === 3) {
      currentY++;
    } else {
      if (map[currentY]?.[currentX] === undefined) currentY++;
      map[currentY][currentX] = 2;
      currentX++;
    }
  }
  return [map, currentX, currentY];
}

module.exports = { getEmoji, updateEmbed, getOffset, handleMovement, generateBlock };
