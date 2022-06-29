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
    game.map[game.pos.y][game.pos.x] = getOldPositionField(game);
    game.map[game.pos.y + y][game.pos.x + x] = 0; //Player
    game.pos.y += y;
    game.pos.x += x;
  }
  return game;
}

function canMove(game, x, y) {
  const move = game.map?.[game.pos.y + y]?.[game.pos.x + x];

  return ![undefined].includes(move);
}

function getOldPositionField(game) {
  if (game.lastField === 1 && game.newField === 2) return 1;
  else if (game.lastField === 2 && game.newField === 1) return 2;
  else if (game.lastField === 2 && game.newField === 2) return 2;
  else return 1;
}

module.exports = { getOffset, handleMovement }