const { GameMap } = require("../../constants/pokemon/map");
const { rows, newSaveModal } = require("../../constants/pokemon/constants");
const { updateEmbed, generateSaveSelection, getStarterPokemon, generateStarterSelection } = require("../../constants/pokemon/functions");
const { MessageEmbed, InteractionCollector } = require("discord.js");
const { sleep } = require("../../constants/util/functions");
const { createProfile, saveProfile } = require("../../constants/pokemon/mongoFunctions");

module.exports = {
  name: "pokemon",
  async execute(interaction) {
    //Deciding which profile to play with
    let profiles = [];
    const profilesFound = await interaction.client.mongo.findOne({ _id: interaction.user.id });
    if (profilesFound) profiles = profilesFound.profiles;

    const reply = await interaction.editReply(generateSaveSelection(profiles));

    const collector = new InteractionCollector(interaction.client, {
      time: 30000, //5 * 60 * 1000,
      message: reply,
    });

    //Once Profile Decided
    let profileIndex; // Profile name for creating
    let Game; // new GameMap()
    let embed; // new MessageEmbed().setDescription(Game.renderMap());
    let name; // Save name for creating

    //Collector
    collector.on("collect", async (i) => {
      if (!i.isButton() && !i.isModalSubmit()) return;
      const id = i.customId;

      //Profile Selection
      if (["0", "1", "2"].includes(id)) {
        profileIndex = id;
        await interaction.editReply({ content: "Loading Game <a:wait:847471618272002059>", embeds: [], components: [] });
        Game = new GameMap(profiles[id].game);
        embed = new MessageEmbed().setDescription(Game.renderMap());
        await sleep(2000);
        await interaction.editReply({ content: null, embeds: [embed], components: rows });
      } else if (id === "newSave") {
        i.showModal(newSaveModal);
      } else if (id === "newSaveModal") {
        //Handles name input
        name = i.fields.getTextInputValue("name");
        //Bad name check (fix stuff like "aa aaa")
        if (name.trim() === "" || name.trim().length < 5) return interaction.followUp({ content: "Can't create a Save with an empty name or a name below 5 Characters.", ephemeral: true }), collector.stop();

        //Show new embed with starter pokemons (function like save selection generation)
        await interaction.editReply(generateStarterSelection());
      } else if (["starter0", "starter1", "starter2"].includes(id)) {
        // Handles getting starter pokemon
        const starterPokemon = getStarterPokemon(id.replace("starter", ""));

        //Generate profile
        Game = new GameMap();
        embed = new MessageEmbed().setDescription(Game.renderMap());
        profileIndex = await createProfile(interaction, name, Game, starterPokemon);
        await interaction.editReply({ content: null, embeds: [embed], components: rows });
      }

      //Defering
      if (!["newSave"].includes(id)) {
        await i.deferUpdate().catch((err) => err);
      }

      collector.resetTimer();

      if (["up", "down", "left", "right"].includes(id)) {
        Game.movePlayer(id);
        updateEmbed(interaction, Game, embed, reply);
      }
    });

    collector.on("end", async () => {
      await interaction.webhook.editMessage(reply, { components: [] }).catch((err) => err);

      if (profileIndex) {
        await saveProfile(interaction, Game, profileIndex);
      }
    });
  },
};
