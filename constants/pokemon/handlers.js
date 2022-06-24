const { generateMenu, updateEmbed } = require("./functions");
const { saveProfile } = require("./mongoFunctions");

async function menuHandler(interaction, reply, Game, profileIndex) {
  const id = interaction?.values?.[0] || interaction.customId;

  if (id === "menu") {
    await reply.edit(generateMenu());
  } else if (id === "save") {
    await saveProfile(interaction, Game, profileIndex);
    return interaction.followUp({ content: "Saved successfully.", ephemeral: true });
  } else if (id === "movement") {
    Game.updateMessage();
  }
}

module.exports = { menuHandler };
