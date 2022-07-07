const { generateEncounterMessage } = require("../functions/generatorFunctions");

async function encounterHandler(Game, pokemon, id) {
  if (id === "pokemonEncounter") {
    // Set enemy pokemon to the found pokemon
    Game.encounterPokemon = pokemon;

    // initiate encoutnter
    await Game.message.edit(generateEncounterMessage(Game));
  }
}

module.exports = { encounterHandler };
