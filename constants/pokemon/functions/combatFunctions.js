const { getRandomNumber } = require("../../util/functions");
const { getPokemonLevel } = require("../functions/utilFunctions");

function calculateDamage(pokemon, move) {
  return (
    (((2 * getPokemonLevel(pokemon.xp)) / 5 + 2 * move.power * getDefenseStat(pokemon, move)) / 50 + 2) *
    1 *
    0.25 *
    1 *
    getCriticalMultiplier(pokemon) *
    getRandomMultiplier() *
    1
  );
}

function getDefenseStat(pokemon, move) {
  return move.class === "physical" ? pokemon.stats["defense"] : pokemon.stats["special-defense"];
}

function getCriticalMultiplier(pokemon) {
  const randomNumber = getRandomNumber(0, 16);
  if (randomNumber == 1) return 1;
  const level = getPokemonLevel(pokemon.xp);
  return (2 * level + 5) / (level + 5);
}

function getRandomMultiplier() {
  return getRandomNumber(85, 100) / 100;
}

//console.log(calculateDamage(pokemonList["CHIMCHAR"], pokemonList["CHIMCHAR"].moves[0].data)) //EXAMPLE USAGE

module.exports = { calculateDamage };
