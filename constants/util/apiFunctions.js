const { titleCase } = require("./functions");
const axions = require("axios");
const { default: axios } = require("axios");

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

async function returnMoves(moveList) {
  // Move Information: https://pokeapi.co/api/v2/move/moveName
  let pokemonMoves = [];

  const filteredList = moveList.filter((move) => move.version_group_details[0].version_group.name === "diamond-pearl");
  let firstAttack = true;

  for (const move of filteredList) {
    // Ignoring moves that arent from level up
    if (move.version_group_details[0].level_learned_at === 0) continue;

    //Getting data from api
    const moveData = (await axios.get(`https://pokeapi.co/api/v2/move/${move.move.name}`)).data;

    //Pushing to array
    if (moveData.damage_class.name === "status" && moveData.meta.healing > 0) {
      pokemonMoves.push({ selected: firstAttack ? true : false, name: titleCase(move.move.name.replaceAll("-", " ")), id: move.move.name, levelLearnedAt: move.version_group_details[0].level_learned_at, data: { type: moveData.damage_class.name, healing: moveData.meta.healing, effect: moveData.effect_entries[0].short_effect.replaceAll("$effect_chance% ", "") } });
      firstAttack = false;
    } else if (["physical", "special"].includes(moveData.damage_class.name)) {
      pokemonMoves.push({ selected: firstAttack ? true : false, name: titleCase(move.move.name.replaceAll("-", " ")), id: move.move.name, levelLearnedAt: move.version_group_details[0].level_learned_at, data: { accuracy: moveData.accuracy, type: moveData.damage_class.name, power: moveData.power, effect: moveData.effect_entries[0].short_effect.replaceAll("$effect_chance% ", "") } });
      firstAttack = false;
    }
  }
  return pokemonMoves.sort((a, b) => a.levelLearnedAt - b.levelLearnedAt);
}

module.exports = { returnTypes, returnStats, returnMoves };
