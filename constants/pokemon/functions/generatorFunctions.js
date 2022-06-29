const { getPokemonString, getEmoji } = require("./utilFunctions");
const { getStarterPokemon } = require("./pokemonFunctions");
const { emojiStringToId } = require("./utilFunctions");

function generateProfileSelection(list) {
  //Embed
  const embed = new MessageEmbed().setTitle("Save Selection").setDescription("Choose a save you want to play.");
  if (list.length > 0) {
    for (const profile of list) {
      embed.addField(`${profile.profile.name}`, `Starter: ${getPokemonString(profile.profile.starterPokemon)}\nPokemon Dollars: **${profile.profile.pokemonDollars}**\nCreated: ${profile.profile.created ? `<t:${profile.profile.created}>` : "Unknown"}`, true);
    }
  } else {
    embed.setDescription("No Profiles found, please create a new one.");
  }

  //Components
  const row = new MessageActionRow();
  if (list.length > 0) {
    let index = 0;
    for (const profile of list) {
      row.components.push(new MessageButton().setCustomId(`profile_${index}`).setLabel(`Load: ${profile.profile.name}`).setStyle("SECONDARY"));
      index++;
    }
    if (row.components.length < 3) row.components.push(new MessageButton().setCustomId("newProfile").setLabel("Create new Profile").setStyle("SUCCESS"));
  } else {
    row.components.push(new MessageButton().setCustomId("newProfile").setLabel("Create new Profle").setStyle("SUCCESS"));
  }
  if (row.components.length > 1) row.components.push(new MessageButton().setCustomId("deleteProfile").setLabel("Delete Profle").setStyle("DANGER"));

  return { embeds: [embed], components: [row] };
}

function generateStarterSelection() {
  //Embed
  const turtwigStarter = getStarterPokemon("TURTWIG");
  const chimcharStarter = getStarterPokemon("CHIMCHAR");
  const piplupStarter = getStarterPokemon("PIPLUP");
  const embed = new MessageEmbed().setTitle("Choose your Starter Pokemon");
  embed
    .addField(`${getPokemonString(turtwigStarter)}`, "**Type:** Grass", true)
    .addField(`${getPokemonString(chimcharStarter)}`, "**Type:** Fire", true)
    .addField(`${getPokemonString(piplupStarter)}`, "**Type:** Water", true);

  //Rows
  const rows = [new MessageActionRow().addComponents(new MessageButton().setCustomId("starter0").setLabel("Turtwig").setStyle("SECONDARY").setEmoji(getEmoji("TURTWIG", turtwigStarter.isShiny)), new MessageButton().setCustomId("starter1").setLabel("Chimchar").setStyle("SECONDARY").setEmoji(getEmoji("CHIMCHAR", chimcharStarter.isShiny)), new MessageButton().setCustomId("starter2").setLabel("Piplup").setStyle("SECONDARY").setEmoji(getEmoji("PIPLUP", piplupStarter.isShiny)))];

  return { message: { embeds: [embed], components: rows }, pokemons: [turtwigStarter, chimcharStarter, piplupStarter] };
}

function generateMenu() {
  const rows = [new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Select an option").setMinValues(1).setMaxValues(1).setCustomId("menuSelect"))];
  const options = [
    { label: "Back to Game", emoji: "977989090714714183", value: "movement" },
    //{ label: "Pokedex", emoji: "989794527952908328", value: "pokedex" },
    { label: "Pokemon Team", emoji: "989792754169167903", value: "pokemonTeam" },
    { label: "Pokemon Storage", emoji: "829731463804485653", value: "pokemonStorage" },
    //{ label: "Bag", emoji: "989794285002047518", value: "bag" },
    { label: "Save", emoji: "989807222051721216", value: "save" },
    { label: "Exit and Save", emoji: "863398571302060032", value: "exitAndSave" },
  ];

  for (const option of options) {
    rows[0].components[0].options.push({ label: option.label, value: option.value, emoji: { id: option.emoji } });
  }

  return { components: rows };
}

function getPokemonTeamRow(team) {
  const rows = [new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Select a Pokemon to View").setMinValues(1).setMaxValues(1).setCustomId("pokemonTeamSelect"))];

  rows[0].components[0].options.push({ label: "Back to Menu", value: "backToMenu", emoji: { id: "977989090714714183" } });

  for (let i = 0; i < team.length; i++) {
    rows[0].components[0].options.push({ label: team[i].isShiny ? `✨ ${team[i].name}` : team[i].name, value: `pokemonTeam_${i}`, emoji: { id: emojiStringToId(getEmoji(team[i].id, team[i].isShiny)) } });
  }

  return { components: rows };
}

async function getStorageRow(Game, int, id) {
  if (id === "pokemonStorage") {
    const rows = [new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Choose your Storage Page").setMinValues(1).setMaxValues(1).setCustomId("storageRowSelect"))];
    const storage = Game.profile.storage;
    rows[0].components[0].options.push({ label: "Back to Menu", emoji: { id: "977989090714714183" }, value: "backToMenu" });
    for (const [key, value] of Object.entries(storage)) {
      if (value.length === 0) continue;

      rows[0].components[0].options.push({ label: `Storage Page ${key}`, value: `storagePage_${key}` });
    }
    if (rows[0].components[0].options.length === 1) return int.followUp({ content: "All your Storage Pages are empty.", ephemeral: true });
    return Game.message.edit({ components: rows });
  }

  if (id.startsWith("storagePage_")) {
    const page = id.split("_")[1];
    const storage = Game.profile.storage[page];
    let rowAmount = 1;
    let pokemonAmount = 0;
    const rows = [int.message.components[0], new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Choose your Pokemon to view").setMinValues(1).setMaxValues(1).setCustomId(`storageRow_${rowAmount}`))];

    for (const pokemon of storage) {
      const options = rows[rowAmount].components[0].options;
      if (options.length === 24) {
        rowAmount++;
        rows.push(new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Choose your Pokemon to view").setMinValues(1).setMaxValues(1).setCustomId(`storageRow_${rowAmount}`)));
      }
      options.push({ label: `${pokemon.isShiny ? `✨ ${pokemon.name}` : pokemon.name}`, value: `storagePokemon_${page}_${pokemonAmount}`, emoji: { id: emojiStringToId(getEmoji(pokemon.id, pokemon.isShiny)) } });
      pokemonAmount++;
    }

    return Game.message.edit({ components: rows });
  }
}

module.exports = { generateProfileSelection, generateStarterSelection, generateMenu, getPokemonTeamRow, getStorageRow }