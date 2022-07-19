const { generateMenu, getPokemonTeamRow, getStorageRow } = require("../functions/generatorFunctions");
const { saveProfile } = require("../functions/mongoFunctions");

async function menuHandler(interaction, Game) {
  const id = interaction?.values?.[0] || interaction.customId;

  //Missing: pokedex, bag

  if (["menu", "backToMenu"].includes(id)) {
    return Game.getMessage().edit(generateMenu());
  }

  if (id === "save") {
    // Saving profile
    await saveProfile(interaction, Game);
    return interaction.followUp({ content: "Saved Successfully.", ephemeral: true });
  }

  if (id === "exitAndSave") {
    // Saving and closing game
    await saveProfile(interaction, Game);
    return Game.getData("collector")?.stop("Saved game and exited");
  }

  if (id === "pokemonTeam") {
    // Showing current Pokemon in the Team
    return Game.getMessage().edit(getPokemonTeamRow(Game.getProfileData("team")));
  }

  if (id === "pokemonStorage") {
    // Openning Menu to choose action for storage
    return Game.getMessage().edit(getStorageRow(Game, interaction, id));
  }
}

module.exports = { menuHandler };
