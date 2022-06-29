function getOffset(id) {
  if (id === "up") return [0, -1]; //x, y
  if (id === "down") return [0, 1];
  if (id === "left") return [-1, 0];
  if (id === "right") return [1, 0];
}

function handleMovement(game, x, y) {
  if (canMove(game, x, y)) {
    game.lastField = game.newField || 1;
    game.newField = game.map[game.pos.y + y][game.pos.x + x];

    //Moving Player
    game.pos.y += y;
    game.pos.x += x;
  }
  return game;
}

function canMove(game, x, y) {
  const move = game.map?.[game.pos.y + y]?.[game.pos.x + x];

  return ![undefined].includes(move);
}

module.exports = { getOffset, handleMovement };
