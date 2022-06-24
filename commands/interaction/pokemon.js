const { GameMap } = require("../../constants/pokemon/map");
const { newProfileModal } = require("../../constants/pokemon/constants");
const { updateEmbed, generateProfileSelection, getStarterPokemon, generateStarterSelection } = require("../../constants/pokemon/functions");
const { InteractionCollector } = require("discord.js");
const { createProfile, saveProfile } = require("../../constants/pokemon/mongoFunctions");
const { menuHandler } = require("../../constants/pokemon/handlers");
const { badName } = require("../../constants/util/functions")

module.exports = {
  name: "pokemon",
  async execute(interaction) {
    //Deciding which profile to play with
    let profiles = [];
    const profilesFound = await interaction.client.mongo.findOne({ _id: interaction.user.id });
    if (profilesFound) profiles = profilesFound.profiles;

    const reply = await interaction.editReply(generateProfileSelection(profiles));

    const collector = new InteractionCollector(interaction.client, {
      time: 30000, //5 * 60 * 1000,
      message: reply,
    });

    //Once Profile Decided
    let Game; // new GameMap()
    let name; // Save name for creating

    //Collector
    collector.on("collect", async (i) => {
      if (!i.isButton() && !i.isModalSubmit() && !i.isSelectMenu()) return;
      const id = i?.values?.[0] || i.customId;

      //Profile Selection
      if (["0", "1", "2"].includes(id)) {
        //Handles Loading Profile
        await reply.edit({ content: "Loading Game <a:wait:989262887317028924>", embeds: [], components: [] });
        Game = new GameMap(profiles[id].game);
        Game.setProfileIndex(id)
        Game.setMessage(reply);
        Game.updateMessage();
        Game.setStarted();
      } else if (id === "newProfile") {
        //Profile Generation Modal
        i.showModal(newProfileModal);
      } else if (id === "newProfileModal") {
        //Handles name input
        name = i.fields.getTextInputValue("name");
        if(badName(name)) return collector.stop("Name input was invalid");

        //Show new embed with starter pokemons (function like save selection generation)
        await reply.edit(generateStarterSelection());
      } else if (["starter0", "starter1", "starter2"].includes(id)) {
        const starterPokemon = getStarterPokemon(id.replace("starter", ""));

        //Generate profile and update message
        Game = new GameMap();
        Game.setMessage(reply);
        Game.updateMessage();
        Game.setStarted();
        Game.setProfileIndex(await createProfile(interaction, name, Game, starterPokemon)); // Function returns profile index
      }

      //Defering
      if (!["newProfile"].includes(id)) {
        await i.deferUpdate().catch((err) => err);
      }

      collector.resetTimer(); //Reset timer on input

      //Menu Handler
      if (["menu", "pokedex", "pokemon", "bag", "save", "movement"].includes(id)) {
        await menuHandler(i, reply, Game, profileIndex);
      }

      //Movement handler
      if (["up", "down", "left", "right"].includes(id)) {
        Game.movePlayer(id);
        Game.updateMessage();
      }
    });

    collector.on("end", async (__, reason) => {
      await reply.edit({ content: reason ? `Command stopped becase: **${reason}**` : null, components: [] }).catch((err) => err);

      if (Game?.isStarted()) {
        await saveProfile(interaction, Game);
      }
    });
  },
};
