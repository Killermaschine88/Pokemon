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

  const filteredList = moveList; //.filter((move) => move.version_group_details[0].version_group.name === "diamond-pearl");

  for (const move of filteredList) {
    // Ignoring moves that arent from level up

    //Getting data from api
    const moveData = (await axios.get(`https://pokeapi.co/api/v2/move/${move.move.name}`)).data;

    //Pushing to array
    if (moveData.damage_class.name === "status" && moveData.meta.healing > 0) {
      /*pokemonMoves.push({
          selected: false,
          name: titleCase(move.move.name.replaceAll("-", " ")),
          id: move.move.name,
          levelLearnedAt: move.version_group_details[0].level_learned_at,
          data: {
            type: titleCase(moveData.type.name),
            class: moveData.damage_class.name,
            healing: moveData.meta.healing,
            effect: moveData.effect_entries.length >= 1 ? moveData.effect_entries[0].short_effect.replaceAll("$effect_chance% ", "") : null,
          },
        });*/
    } else if (["physical", "special"].includes(moveData.damage_class.name)) {
      pokemonMoves.push({
        selected: false,
        name: titleCase(move.move.name.replaceAll("-", " ")),
        id: move.move.name,
        levelLearnedAt: move.version_group_details?.[0].level_learned_at || null,
        type: titleCase(moveData.type.name),
        data: {
          power: moveData.power,
          accuracy: moveData.accuracy,
          class: moveData.damage_class.name,
        },
      });
    }
  }
  let sorted = pokemonMoves.sort((a, b) => (a == null ? Infinity : a.levelLearnedAt) - (b == null ? Infinity : b.levelLearnedAt));
  if (sorted[0]) {
    sorted[0].selected = true;
  }
  return sorted;
}

function returnSprites(sprites) {
  return {
    back: {
      normal: sprites.back_default,
      shiny: sprites.back_shiny,
    },
    front: {
      normal: sprites.front_default,
      shiny: sprites.front_shiny,
    },
  };
}

module.exports = { returnTypes, returnStats, returnMoves, returnSprites };
