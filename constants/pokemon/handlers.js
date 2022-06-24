const { generateMenu, updateEmbed } = require("./functions");
const { saveProfile } = require("./mongoFunctions");

async function menuHandler(interaction, Game) {
  const id = interaction?.values?.[0] || interaction.customId;

  if (id === "menu") {
    await Game.getMessage().edit(generateMenu());
  } else if (id === "save") {
    await saveProfile(interaction, Game);
    return interaction.followUp({ content: "Saved successfully.", ephemeral: true });
  } else if (id === "movement") {
    Game.updateMessage();
  } else if (id === "exitAndSave") {
    await saveProfile(interaction, Game);
    Game.getData("collector")?.stop("Saved game and exited");
  }
}

module.exports = { menuHandler };
