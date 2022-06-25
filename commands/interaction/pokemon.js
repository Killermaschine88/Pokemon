const { GameMap } = require("../../constants/pokemon/map");
const { newProfileModal } = require("../../constants/pokemon/constants");
const { generateProfileSelection, getStarterPokemon, generateStarterSelection } = require("../../constants/pokemon/functions");
const { InteractionCollector } = require("discord.js");
const { createProfile, saveProfile } = require("../../constants/pokemon/mongoFunctions");
const { menuHandler, storageHandler } = require("../../constants/pokemon/handlers");
const { badName } = require("../../constants/util/functions");
const { hasProfileWithName } = require("../../constants/pokemon/mongoFunctions");

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
        Game = new GameMap(profiles[id]);
        Game.setStarted().setProfileIndex(id).setVariables(interaction, collector).setMessage(reply).updateMessage();
      }

      //Profile Generation Modal
      if (id === "newProfile") {
        i.showModal(newProfileModal);
      }

      //Handles name input
      if (id === "newProfileModal") {
        await i.deferUpdate().catch((err) => err);
        name = i.fields.getTextInputValue("name").trim();
        if (badName(name)) return i.deferUpdate().catch((err) => err), collector.stop("Name input was invalid");
        if (await hasProfileWithName(interaction, name)) return i.deferUpdate().catch((err) => err), interaction.followUp({ content: `Can't create another profile with the name \`${name}\` as a profile with that name already exists.`, ephemeral: true });

        //Show new embed with starter pokemons (function like save selection generation)
        await reply.edit(generateStarterSelection());
      }

      //Generate profile and update message
      if (["starter0", "starter1", "starter2"].includes(id)) {
        const starterPokemon = getStarterPokemon(id.replace("starter", ""));

        Game = new GameMap();
        await createProfile(interaction, name, Game, starterPokemon);
        profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
        await interaction.editReply(generateProfileSelection(profiles));
      }

      //Defering
      await i.deferUpdate().catch((err) => err);

      collector.resetTimer(); //Reset timer on input

      // Returning components back to walking row
      if (id === "movement") {
        Game.updateMessage();
      }

      //Pokemon Menu handler
      if (id.startsWith("pokemonTeam_")) {
        Game.getPokemonTeamInfo(i, id.replace("pokemonTeam_", "")); // Display info for selected pokemon in team
      }

      // PC Handler (Depositing and Withdrawing Pokemon)
      if(id.startsWith("withdrawPokemon_") || id.startsWith("depositPokemon_")) {
        await storageHandler(i, Game);
      }

      //Menu Handler
      if (["menu", "pokedex", "pokemonTeam", "bag", "save", "exitAndSave", "backToMenu", "pokemonStorage"].includes(id)) {
        await menuHandler(i, Game);
      }

      //Movement handler
      if (["up", "down", "left", "right"].includes(id)) {
        Game.movePlayer(id);
        Game.updateMessage();
      }
    });

    collector.on("end", async (__, reason) => {
      await reply.edit({ content: reason !== "time" ? `Command stopped because: **${reason}**` : null, components: [] }).catch((err) => err);

      if (Game?.isStarted()) {
        await saveProfile(interaction, Game);
      }
    });
  },
};
