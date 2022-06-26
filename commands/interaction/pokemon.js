const { GameMap } = require("../../constants/pokemon/map");
const { newProfileModal, deleteProfileModal } = require("../../constants/pokemon/constants");
const { generateProfileSelection, getStarterPokemon, generateStarterSelection, withdrawPokemon } = require("../../constants/pokemon/functions");
const { InteractionCollector } = require("discord.js");
const { createProfile, saveProfile, deleteProfile } = require("../../constants/pokemon/mongoFunctions");
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
      time: 10000, //5 * 60 * 1000,
    });

    //Once Profile Decided
    let Game; // new GameMap()
    let name; // Save name for creating

    //Collector
    collector.on("collect", async (i) => {
      if(i.user.id !== interaction.user.id) return
      if (!i.isButton() && !i.isModalSubmit() && !i.isSelectMenu()) return;
      const id = i?.values?.[0] || i.customId;

      if (!["newProfile", "deleteProfile"].includes(id)) {
        await i.deferUpdate().catch((err) => err);
      }
      collector.resetTimer(); //Reset timer on input

      //Profile Selection
      if (id.startsWith("profile_")) {
        //Handles Loading Profile
        const profileId = id.replace("profile_", "");
        await reply.edit({ content: "Loading Game <a:wait:989262887317028924>", embeds: [], components: [] });
        Game = new GameMap(profiles[profileId]);
        return await Game.setStarted().setProfileIndex(profileId).setVariables(interaction, collector).setMessage(reply).updateMessage();
      }

      //Profile Generation Modal
      if (id === "newProfile") {
        return await i.showModal(newProfileModal);
      }

      //Profile deletion modal
      if (id === "deleteProfile") {
        return await i.showModal(deleteProfileModal);
      }

      //Handles name input
      if (id === "newProfileModal") {
        await i.deferUpdate().catch((err) => err);
        name = i.fields.getTextInputValue("name").trim();
        if (badName(name)) return i.deferUpdate().catch((err) => err), collector.stop("Name input was invalid");
        if (await hasProfileWithName(interaction, name)) return i.deferUpdate().catch((err) => err), interaction.followUp({ content: `Can't create another profile with the name \`${name}\` as a profile with that name already exists.`, ephemeral: true });

        //Show new embed with starter pokemons (function like save selection generation)
        return await reply.edit(generateStarterSelection());
      }

      //Handle profile deletion
      if (id === "deleteProfileModal") {
        await i.deferUpdate().catch((err) => err);
        name = i.fields.getTextInputValue("name").trim();
        if (badName(name)) return i.deferUpdate().catch((err) => err), collector.stop("Name input was invalid");
        if (!(await hasProfileWithName(interaction, name))) return i.deferUpdate().catch((err) => err), interaction.followUp({ content: `Can't delete profile with the name \`${name}\` as it doesn't exist exists.`, ephemeral: true });

        await deleteProfile(interaction, name);
        profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
        return await interaction.editReply(generateProfileSelection(profiles));
      }

      //Generate profile and update message
      if (["starter0", "starter1", "starter2"].includes(id)) {
        const starterPokemon = getStarterPokemon(id.replace("starter", ""));

        Game = new GameMap();
        await createProfile(interaction, name, Game, starterPokemon);
        profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
        return await interaction.editReply(generateProfileSelection(profiles));
      }

      // Returning components back to walking row
      if (id === "movement") {
        return await Game.updateMessage();
      }

      //Pokemon Menu handler
      if (id.startsWith("pokemonTeam_")) {
        return await Game.getPokemonTeamInfo(i, id.replace("pokemonTeam_", "")); // Display info for selected pokemon in team
      }

      // Display Storage Rows
      if (id === "displayStorageRows" || id.startsWith("storagePage_")) {
        return await Game.getStorageRow(i, id); //To display pokemon only
      }

      // Display specified pokemon from storage
      if(id.startsWith("storagePokemon_")) {
        return await Game.showStoragePokemon(i, id)
      }

      if(id.startsWith("withdrawPokemon_")) {
        i.message.components[0].components[0].disabled = true
        await i.editReply({ components: i.message.components })
        return await withdrawPokemon(id, i, Game)
      }

      // PC Handler (Depositing and Withdrawing Pokemon) // INWORK
      /*if (id.startsWith("viewPokemon_") || id.startsWith("withdrawPokemon_") || id.startsWith("storePokemon_")) {
        return await storageHandler(i, id, Game);
      }*/

      //Menu Handler
      if (["menu", "pokedex", "pokemonTeam", "bag", "save", "exitAndSave", "backToMenu", "pokemonStorage"].includes(id)) {
        return await menuHandler(i, Game);
      }

      //Movement handler
      if (["up", "down", "left", "right"].includes(id)) {
        return await Game.movePlayer(id).updateMessage();
      }
    });

    collector.on("end", async (__, reason) => {
      await Game.getMessage()
        .edit({ content: reason !== "time" ? `Command stopped because: **${reason}**` : null, components: [] })
        .catch((err) => err);

      if (Game?.isStarted()) {
        return await saveProfile(interaction, Game);
      }
    });
  },
};
