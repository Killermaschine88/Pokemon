const { titleCase } = require("./functions");

function returnTypes(typeList) {
  let pokemonTypes = [];
  for (const type of typeList) {
    pokemonTypes.push(titleCase(type.type.name));
  }
  return pokemonTypes;
}

function returnStats(statList) {
  let pokemonStats = {};

  for (const stat of statList) {
    pokemonStats[stat.stat.name] = stat.base_stat;
  }
  return pokemonStats;
}

function returnMoves(moveList) { // Move Information: https://pokeapi.co/api/v2/move/moveName
  let pokemonMoves = [];

  const filteredList = moveList.filter((move) => move.version_group_details[0].version_group.name === "diamond-pearl");

  for (const move of filteredList) {
    if (move.version_group_details[0].level_learned_at === 0) continue;
    pokemonMoves.push({ name: titleCase(move.move.name.replaceAll("-", " ")), id: move.move.name, levelLearnedAt: move.version_group_details[0].level_learned_at });
  }
  return pokemonMoves.sort((a, b) => a.levelLearnedAt - b.levelLearnedAt);
}

module.exports = { returnTypes, returnStats, returnMoves };
