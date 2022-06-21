const { GameMap } = require("../../constants/pokemon/map");
const { rows, newSaveModal } = require("../../constants/pokemon/constants");
const { updateEmbed, generateProfileSelection } = require("../../constants/pokemon/functions");
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

    const reply = await interaction.editReply(generateProfileSelection(profiles));

    const collector = reply.createMessageComponentCollector({
      componentType: "BUTTON",
      time: 5 * 60 * 1000,
    });

    createProfile(interaction);

    //Once Profile Decided
    let Game;
    let embed; //new MessageEmbed().setDescription(Game.renderMap());

    //Collector
    collector.on("collect", async (i) => {
      const id = i.customId;

      //Profile Selection
      if ([0, 1, 2].includes(id)) {
        await interaction.editReply("Loading Game <a:wait:847471618272002059>");
        Game = new GameMap({ existingSave: profiles[id] });
        embed = new MessageEmbed().setDescription(Game.renderMap());
        await interaction.editReply({ content: null, embeds: [embed], components: rows });
      } else if (id === "newSave") {
        i.showModal(newSaveModal)
        const resInteraction = await i.awaitModalSubmit({ time: 60000 }).catch(err => collector.stop());
        resInteraction.deferUpdate()
        const name = resInteraction.fields.getTextInputValue("name")
        console.log(name)
      }

      if (["newSave"].includes(id)) {
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
