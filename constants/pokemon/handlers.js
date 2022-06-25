const { generateMenu, getPokemonTeamRow } = require("./functions");
const { saveProfile } = require("./mongoFunctions");

async function menuHandler(interaction, Game) {
  const id = interaction?.values?.[0] || interaction.customId;

  //Missing: pokedex, bag

  if (["menu", "backToMenu"].includes(id)) {
    await Game.getMessage().edit(generateMenu());
  } else if (id === "save") {
    // Saving profile
    await saveProfile(interaction, Game);
    return interaction.followUp({ content: "Saved successfully.", ephemeral: true });
  } else if (id === "exitAndSave") {
    // Saving and closing game
    await saveProfile(interaction, Game);
    Game.getData("collector")?.stop("Saved game and exited");
  } else if (id === "pokemonTeam") {
    // Showing current Pokemon in the Team
    Game.getMessage().edit(getPokemonTeamRow(Game.getProfile().team));
  }
}

module.exports = { menuHandler };
