const { generateEncounterMessage } = require("../functions/generatorFunctions");

function startEncounter(Game, enemyTeam) {
  // Set enemy pokemon to the found pokemon
  Game.encounter = {
    team: Game.profile.team,
    enemyTeam: enemyTeam,
  };

  // initiate encoutnter
  Game.message.edit(generateEncounterMessage(Game));
}

module.exports = { startEncounter };
