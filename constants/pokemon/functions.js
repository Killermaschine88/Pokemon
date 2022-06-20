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

  return [undefined, 2].includes(move);
}

//Make working below here so it properly places the fields and shit in planned way

function generateMap({ width, height }) {
  let map = Array.from({ length: height }).map(() => []);
}

module.exports = { getEmoji, updateEmbed, getOffset, handleMovement, generateMap };
