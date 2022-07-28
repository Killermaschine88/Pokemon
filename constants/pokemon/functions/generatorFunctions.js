const { getPokemonString, getEmoji } = require("./utilFunctions");
const { getStarterPokemon } = require("./pokemonFunctions");
const { emojiStringToId } = require("./utilFunctions");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle } = require("discord.js");

function generateProfileSelection(list) {
  //Embed
  const embed = new EmbedBuilder().setTitle("Save Selection").setDescription("Choose a save you want to play.");
  if (list.length > 0) {
    for (const profile of list) {
      embed.addFields({
        name: `${profile.profile.name}`,
        value: `Starter: ${getPokemonString(profile.profile.starterPokemon)}\nPokemon Dollars: **${profile.profile.pokemonDollars}**\nCreated: ${
          profile.profile.created ? `<t:${profile.profile.created}>` : "Unknown"
        }`,
        inline: true,
      });
    }
  } else {
    embed.setDescription("No Profiles found, please create a new one.");
  }

  //Components
  const row = new ActionRowBuilder();
  if (list.length > 0) {
    let index = 0;
    for (const profile of list) {
      row.components.push(
        new ButtonBuilder().setCustomId(`profile_${index}`).setLabel(`Load: ${profile.profile.name}`).setStyle(ButtonStyle.Secondary)
      );
      index++;
    }
    if (row.components.length < 3)
      row.components.push(new ButtonBuilder().setCustomId("newProfile").setLabel("Create new Profile").setStyle("Success"));
  } else {
    row.components.push(new ButtonBuilder().setCustomId("newProfile").setLabel("Create new Profle").setStyle("Success"));
  }
  if (row.components.length > 1)
    row.components.push(new ButtonBuilder().setCustomId("deleteProfile").setLabel("Delete Profle").setStyle(ButtonStyle.Danger));

  return { embeds: [embed], components: [row] };
}

function generateStarterSelection() {
  //Embed
  const turtwigStarter = getStarterPokemon("TURTWIG");
  const chimcharStarter = getStarterPokemon("CHIMCHAR");
  const piplupStarter = getStarterPokemon("PIPLUP");
  const embed = new EmbedBuilder().setTitle("Choose your Starter Pokemon");
  embed.addFields([
    { name: `${getPokemonString(turtwigStarter)}`, value: `**Type:** ${turtwigStarter.type}`, inline: true },
    { name: `${getPokemonString(chimcharStarter)}`, value: "**Type:** Fire", inline: true },
    { name: `${getPokemonString(piplupStarter)}`, value: "**Type:** Water", inline: true },
  ]);

  //Rows
  const rows = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("starter0")
        .setLabel("Turtwig")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(getEmoji("TURTWIG", turtwigStarter.isShiny)),
      new ButtonBuilder()
        .setCustomId("starter1")
        .setLabel("Chimchar")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(getEmoji("CHIMCHAR", chimcharStarter.isShiny)),
      new ButtonBuilder()
        .setCustomId("starter2")
        .setLabel("Piplup")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(getEmoji("PIPLUP", piplupStarter.isShiny))
    ),
  ];

  return { message: { embeds: [embed], components: rows }, pokemons: [turtwigStarter, chimcharStarter, piplupStarter] };
}

function generateMenu() {
  const rows = [
    new ActionRowBuilder().addComponents(
      new SelectMenuBuilder().setPlaceholder("Select an option").setMinValues(1).setMaxValues(1).setCustomId("menuSelect")
    ),
  ];
  const options = [
    { label: "Back to Game", emoji: { id: "977989090714714183" }, value: "movement" },
    //{ label: "Pokedex", emoji: "989794527952908328", value: "pokedex" },
    { label: "Pokemon Team", emoji: { id: "989792754169167903" }, value: "pokemonTeam" },
    { label: "Pokemon Storage", emoji: { id: "829731463804485653" }, value: "pokemonStorage" },
    //{ label: "Bag", emoji: "989794285002047518", value: "bag" },
    { label: "Settings", emoji: { id: "859388128040976384" }, value: "settings" },
    { label: "Save", emoji: { id: "989807222051721216" }, value: "save" },
    { label: "Exit and Save", emoji: { id: "863398571302060032" }, value: "exitAndSave" },
  ];

  rows[0].components[0].addOptions(options);

  return { components: rows };
}

function getPokemonTeamRow(team) {
  const rows = [
    new ActionRowBuilder().addComponents(
      new SelectMenuBuilder().setPlaceholder("Select a Pokemon to View").setMinValues(1).setMaxValues(1).setCustomId("pokemonTeamSelect")
    ),
  ];

  let options = [{ label: "Back to Menu", value: "backToMenu", emoji: { id: "977989090714714183" } }];

  for (let i = 0; i < team.length; i++) {
    options.push({
      label: team[i].isShiny ? `✨ ${team[i].name}` : team[i].name,
      value: `pokemonTeam_${i}`,
      emoji: { id: emojiStringToId(getEmoji(team[i].id, team[i].isShiny)) },
    });
  }

  rows[0].components[0].addOptions(options);

  return { components: rows };
}

async function getStorageRow(Game, int, id) {
  if (id === "pokemonStorage") {
    const rows = [
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder().setPlaceholder("Choose your Storage Page").setMinValues(1).setMaxValues(1).setCustomId("storageRowSelect")
      ),
    ];
    const storage = Game.profile.storage;
    let options = [];
    rows[0].components[0].options.push({ label: "Back to Menu", emoji: { id: "977989090714714183" }, value: "backToMenu" });
    for (const [key, value] of Object.entries(storage)) {
      if (value.length === 0) continue;

      options.push({ label: `Storage Page ${key}`, value: `storagePage_${key}` });
    }

    // Adding newly generated options
    rows[0].components[0].addOptions(options);

    if (rows[0].components[0].options.length === 1) {
      int.followUp({ content: "All your Storage Pages are empty.", ephemeral: true });
      return Game.message.edit(generateMenu());
    }
    return Game.message.edit({ components: rows });
  }

  if (id.startsWith("storagePage_")) {
    const page = id.split("_")[1];
    const storage = Game.profile.storage[page];
    let rowAmount = 1;
    let pokemonAmount = 0;
    const rows = [
      int.message.components[0],
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder().setPlaceholder("Choose your Pokemon to view").setMinValues(1).setMaxValues(1).setCustomId(`storageRow_${rowAmount}`)
      ),
    ];

    let selectOptions = [];
    for (const pokemon of storage) {
      if (rows[rowAmount].components[0].options.length === 24) {
        rows[rowAmount].components[0].addOptions(selectOptions);
        options = [];
        rowAmount++;
        rows.push(
          new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
              .setPlaceholder("Choose your Pokemon to view")
              .setMinValues(1)
              .setMaxValues(1)
              .setCustomId(`storageRow_${rowAmount}`)
          )
        );
      }
      selectOptions.push({
        label: `${pokemon.isShiny ? `✨ ${pokemon.name}` : pokemon.name}`,
        value: `storagePokemon_${page}_${pokemonAmount}`,
        emoji: { id: emojiStringToId(getEmoji(pokemon.id, pokemon.isShiny)) },
      });
      pokemonAmount++;
    }

    return Game.message.edit({ components: rows });
  }
}

function generateEncounterMessage(Game) {
  const enemy = Game.console.log(`found ${enemy.name}`);
  const embed = new EmbedBuilder().setTitle("Pokemon Fight")

  // TODO: add functino to generate the embed and also add team id's to pokemon

  const rows = [];

  return { embeds: [embed], components: rows };
}

function generateSettingsRow() {
  const rows = [
    new ActionRowBuilder().addComponents(
      new SelectMenuBuilder().setPlaceholder("Choose the Setting to toggle").setMinValues(1).setMaxValues(1).setCustomId("settingsSelect")
    ),
  ];
  
  const options = [
    { label: "Back to Menu", value: "backToMenu", emoji: { id: "977989090714714183" } },
    { label: "Show other players in the Map", value: "showOtherPlayers", emoji: { name: "👪" } },
  ];

  rows[0].components[0].addOptions(options);

  return { components: rows };
}

module.exports = {
  generateProfileSelection,
  generateStarterSelection,
  generateMenu,
  getPokemonTeamRow,
  getStorageRow,
  generateEncounterMessage,
  generateSettingsRow,
};
