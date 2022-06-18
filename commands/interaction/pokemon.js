const { GameMap } = require("../../constants/pokemon/map");
const { rows } = require("../../constants/pokemon/constants");
const { updateEmbed } = require("../../constants/pokemon/functions");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "pokemon",
  async execute(interaction) {
    await interaction.editReply("Loading Game <a:wait:847471618272002059>");
    const Game = new GameMap();
    const embed = new MessageEmbed().setDescription(Game.renderMap());

    const reply = await interaction.editReply({ content: null, embeds: [embed], components: rows });

    const collector = reply.createMessageComponentCollector({
      componentType: "BUTTON",
      time: 14 * 60 * 1000,
    });

    //Collector
    collector.on("collect", async (i) => {
      await i.deferUpdate();
      collector.resetTimer();
      const id = i.customId;

      if (["up", "down", "left", "right"].includes(id)) {
        Game.movePlayer(id);
        updateEmbed(interaction, Game, embed);
      }
    });
  },
};
