const { GameMap } = require("../../constants/pokemon/map");
const { rows } = require("../../constants/pokemon/constants");
const { updateEmbed } = require("../../constants/pokemon/functions");
const { MessageEmbed } = require("discord.js");
const { sleep } = require("../../constants/util/functions");
const { createProfile } = require("../../constants/pokemon/mongoFunctions");

module.exports = {
  name: "pokemon",
  async execute(interaction) {
    //Deciding which profile to play with
    let profiles = [];
    const profilesFound = await interaction.client.mongo.findOne({ _id: interaction.user.id });
    if (profilesFound) profiles = profilesFound.profiles;

    createProfile(interaction);

    //Once Profile Decided
    await interaction.editReply("Loading Game <a:wait:847471618272002059>");
    const Game = new GameMap({});
    const embed = new MessageEmbed().setDescription(Game.renderMap());

    //When Game Decided
    const reply = await interaction.editReply({ content: null, embeds: [embed], components: rows });

    const collector = reply.createMessageComponentCollector({
      componentType: "BUTTON",
      time: 5 * 60 * 1000,
    });

    //Collector
    collector.on("collect", async (i) => {
      const id = i.customId;

      if ([].includes(id)) {
        //
      } else {
        await i.deferUpdate();
      }

      collector.resetTimer();

      if (["up", "down", "left", "right"].includes(id)) {
        Game.movePlayer(id);
        updateEmbed(interaction, Game, embed, reply);
      }
    });

    collector.on("end", async () => {
      await interaction.webhook.editMessage(reply, { components: [] }).catch((err) => err);
    });
  },
};
