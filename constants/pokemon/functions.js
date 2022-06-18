const { emojis } = require("./constants");

function getEmoji(name, way = "down") {
  if (name === 0) return emojis[name + way];
  else return emojis[name];
}

function updateEmbed(interaction, Game, embed) {
  embed.setDescription(Game.renderMap());
  interaction.editReply({ embeds: [embed] });
}

function getOffset(id) {
  if (id === "up") [0, -1];
  if (id === "down") [0, 1];
  if (id === "left") [-1, 0];
  if (id === "right") [1, 0];
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

module.exports = { getEmoji, updateEmbed, getOffset, handleMovement };
