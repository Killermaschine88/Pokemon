const { GameMap } = require("../../constants/pokemon/classes/map");
const { newProfileModal, deleteProfileModal } = require("../../constants/pokemon/constants/discord");
const { generateProfileSelection, generateStarterSelection } = require("../../constants/pokemon/functions/generatorFunctions");
const { withdrawPokemon, depositPokemon } = require("../../constants/pokemon/functions/storageFunctions");
const { InteractionCollector } = require("discord.js");
const { createProfile, saveProfile, deleteProfile } = require("../../constants/pokemon/functions/mongoFunctions");
const { encounterHandler } = require("../../constants/pokemon/handlers/encounterHandler");
const { menuHandler } = require("../../constants/pokemon/handlers/menuHandler");
const { badName } = require("../../constants/util/functions");
const { hasProfileWithName } = require("../../constants/pokemon/functions/mongoFunctions");

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
    });

    //Once Profile Decided
    let Game; // new GameMap()
    let name; // Save name for creating
    let starterPokemons; // Pokemons from starter selection
    let enemyPokemon; // Pokemon found at random grass encounter

    //Collector
    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) return;
      if (!i.isButton() && !i.isModalSubmit() && !i.isSelectMenu()) return;
      const id = i?.values?.[0] || i.customId;

      if (!["newProfile", "deleteProfile"].includes(id)) {
        await i.deferUpdate().catch((err) => err);
      }
      collector.resetTimer(); //Reset timer on input

      //PROFILE_SECTION

      //Profile Selection
      if (id.startsWith("profile_")) {
        //Handles Loading Profile
        const profileId = id.replace("profile_", "");
        await reply.edit({ content: "Loading Game <a:wait:989262887317028924>", embeds: [], components: [] });
        Game = new GameMap(profiles[profileId]);
        return Game.setStarted().setProfileIndex(profileId).setVariables(interaction, collector).setMessage(reply).updateMessage();
      }

      //Profile Generation Modal
      if (id === "newProfile") {
        return i.showModal(newProfileModal);
      }

      //Profile deletion modal
      if (id === "deleteProfile") {
        return i.showModal(deleteProfileModal);
      }

      //Handles name input
      if (id === "newProfileModal") {
        await i.deferUpdate().catch((err) => err);
        name = i.fields.getTextInputValue("name").trim();
        if (badName(name)) return i.deferUpdate().catch((err) => err), collector.stop("Name input was invalid");
        if (await hasProfileWithName(interaction, name)) return i.deferUpdate().catch((err) => err), interaction.followUp({ content: `Can't create another profile with the name \`${name}\` as a profile with that name already exists.`, ephemeral: true });

        //Show new embed with starter pokemons (function like save selection generation)
        const res = generateStarterSelection();
        starterPokemons = res.pokemons;
        return reply.edit(res.message);
      }

      //Handle profile deletion
      if (id === "deleteProfileModal") {
        await i.deferUpdate().catch((err) => err);
        name = i.fields.getTextInputValue("name").trim();
        if (badName(name)) return i.deferUpdate().catch((err) => err), collector.stop("Name input was invalid");
        if (!(await hasProfileWithName(interaction, name))) return i.deferUpdate().catch((err) => err), interaction.followUp({ content: `Can't delete profile with the name \`${name}\` as it doesn't exist exists.`, ephemeral: true });

        await deleteProfile(interaction, name);
        profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
        return interaction.editReply(generateProfileSelection(profiles));
      }

      //Generate profile and update message
      if (["starter0", "starter1", "starter2"].includes(id)) {
        const starterPokemon = starterPokemons[id.replace("starter", "")];

        Game = new GameMap();
        await createProfile(interaction, name, Game, starterPokemon);
        profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
        return interaction.editReply(generateProfileSelection(profiles));
      }

      //GAME_SECTION

      // Returning components back to walking row
      if (id === "movement") {
        return Game.updateMessage();
      }

      //Pokemon Menu handler
      if (id.startsWith("pokemonTeam_")) {
        return Game.getPokemonTeamInfo(i, id.replace("pokemonTeam_", "")); // Display info for selected pokemon in team
      }

      // Display Storage Rows
      if (id === "displayStorageRows" || id.startsWith("storagePage_")) {
        return Game.getStorageRow(i, id); //To display pokemon only
      }

      // Display specified pokemon from storage
      if (id.startsWith("storagePokemon_")) {
        return Game.showStoragePokemon(i, id);
      }

      // Withdraw Pokemon from Storage
      if (id.startsWith("withdrawPokemon_")) {
        i.message.components[0].components[0].disabled = true;
        await i.editReply({ components: i.message.components });
        return withdrawPokemon(id, i, Game);
      }

      // Deposit pokemon to storage
      if (id.startsWith("depositPokemon_")) {
        i.message.components[0].components[0].disabled = true;
        await i.editReply({ components: i.message.components });
        return depositPokemon(id, i, Game);
      }

      //Menu Handler
      if (["menu", "pokedex", "pokemonTeam", "bag", "save", "exitAndSave", "backToMenu", "pokemonStorage"].includes(id)) {
        return menuHandler(i, Game);
      }

      //Movement handler
      if (["up", "down", "left", "right"].includes(id)) {
        Game.movePlayer(id).updateMessage();
      }

      // COMBAT_SECTION
      const res = Game.pokemonSpawned();
      if (res?.spawned) {
        return encounterHandler(Game, res.pokemon, "pokemonEncounter");
      }

      if([].includes(id)) {
        const combatResult = await encounterHandler(Game, enemyPokemon, id)
        if(combatResult.state === "encounterDead") {

        }
      }
    });

    collector.on("end", async (__, reason) => {
      await reply.edit({ content: reason !== "time" ? `Command stopped because: **${reason}**` : null, components: [] }).catch((err) => err);

      if (Game?.isStarted()) {
        return saveProfile(interaction, Game);
      }
    });
  },
};
