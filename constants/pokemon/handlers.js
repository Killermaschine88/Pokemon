const { generateMenu, updateEmbed } = require("./functions");
const { saveProfile } = require("./mongoFunctions");

async function menuHandler(interaction, Game) {
  const id = interaction?.values?.[0] || interaction.customId;

  //Missing: pokedex, pokemon, bag

  if (id === "menu") {
    await Game.getMessage().edit(generateMenu());
  } else if (id === "save") {
    // Saving profile
    await saveProfile(interaction, Game);
    return interaction.followUp({ content: "Saved successfully.", ephemeral: true });
  } else if (id === "movement") {
    // Returning components back to walking row
    Game.updateMessage();
  } else if (id === "exitAndSave") {
    // Saving and closing game
    await saveProfile(interaction, Game);
    Game.getData("collector")?.stop("Saved game and exited");
  } else if (id === "pokemon") {
    // Showing current Pokemon in the Team
  }
}

module.exports = { menuHandler };
