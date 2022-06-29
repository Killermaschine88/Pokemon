const { getRandomNumber } = require("../../util/functions");
const pokemonList = require("../../JSON/pokemonList.json");
const { ignoredPokemon } = require("../constants/pokemon");

function pokemonFound() {
  return getRandomNumber(0, 10) <= 5; //FIXME: Change 10 to 100 again later for 5% chance
}

function generateRandomPokemon() {
  let pokemonNames = Object.keys(pokemonList);
  pokemonNames = pokemonNames.filter((pokemon) => !ignoredPokemon.includes(pokemon));
  const pokemon = pokemonNames[Math.floor(Math.random() * pokemonNames.length)];
  if (isShinyPokemon()) pokemon.isShiny = true;
  return pokemonList[pokemon];
}

function getStarterPokemon(id) {
  const starterPokemon = pokemonList[id];

  if (isShinyPokemon()) {
    starterPokemon.isShiny = true;
  }

  return starterPokemon;
}

function isShinyPokemon() {
  return getRandomNumber(0, 4096) <= 1;
}

module.exports = { pokemonFound, generateRandomPokemon, isShinyPokemon, getStarterPokemon };
