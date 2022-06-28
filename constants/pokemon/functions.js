let emojis = require("../JSON/emojiList");
const pokemonList = require("../JSON/pokemonList");
const { xpList } = require("../JSON/xpList");
const { getRandomNumber, emojiStringToId, titleCase } = require("../util/functions");
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
const { client } = require("../../index");
const fs = require("fs");
const pokemon = require("../../commands/interaction/pokemon");

function getEmoji(name, shiny = false, way = "down") {
  if (!isNaN(name)) {
    if (name === 0) return emojis[name + way];
    else return emojis[name];
  }

  name = name.toUpperCase();

  if (!emojis[name]) {
    client.channels.cache.get("990697665719316510").send(`Missing emoji for ${name}`);
    return emojis["MISSING_TEXTURE"];
  }

  if (shiny) return emojis[name].shiny;
  else return emojis[name].normal;
}

function getOffset(id) {
  if (id === "up") return [0, -1]; //x, y
  if (id === "down") return [0, 1];
  if (id === "left") return [-1, 0];
  if (id === "right") return [1, 0];
}

function handleMovement(game, x, y) {
  if (canMove(game, x, y)) {
    game.lastField = game.newField || 1;
    game.newField = game.map[game.pos.y + y][game.pos.x + x];

    //Moving Player
    game.map[game.pos.y][game.pos.x] = getOldPositionField(game);
    game.map[game.pos.y + y][game.pos.x + x] = 0; //Player
    game.pos.y += y;
    game.pos.x += x;
  }
  return game;
}

function canMove(game, x, y) {
  const move = game.map?.[game.pos.y + y]?.[game.pos.x + x];

  return ![undefined].includes(move);
}

function getOldPositionField(game) {
  if (game.lastField === 1 && game.newField === 2) return 1;
  else if (game.lastField === 2 && game.newField === 1) return 2;
  else if (game.lastField === 2 && game.newField === 2) return 2;
  else return 1;
}

function generateMap({ width, height }) {
  let map = Array.from({ length: height }).map(() => []);
  let mapGenerating = true;
  let x = 0;
  let y = 0;

  while (mapGenerating) {
    const randomNum = getRandomNumber(0, 100, false);

    if (randomNum <= 1.5) {
      //Grass Chance
      const [fieldWidth, fieldHeight] = getFieldSize();

      let newX = x;
      let newY = y;

      for (let i = 0; i < fieldHeight; i++) {
        for (let j = 0; j < fieldWidth; j++) {
          if (newY + j < width && newX + i < height) map[newY + j][newX + i] = 2;
        }
      }
    } else {
      if (![2].includes(map[y][x])) map[y][x] = 1;
      x++;
      if (x >= width) {
        y++;
        x = 0;
      }
    }

    if (mapFinished(map, width)) mapGenerating = false;
  }
  return map;
}

function mapFinished(map, width) {
  return map.every((arr) => arr.length >= width);
}

function getFieldSize() {
  //Width x Height
  const fields = [
    [5, 5],
    [5, 8],
    [3, 3],
  ];

  return fields[Math.floor(Math.random() * fields.length)];
}

function pokemonFound() {
  const rn = getRandomNumber(0, 100);
  return rn <= 5;
}

function generateRandomPokemon() {
  let pokemonNames = Object.keys(pokemonList);
  const pokemon = pokemonNames[Math.floor(Math.random() * pokemonNames.length)];
  return pokemonList[pokemon];
}

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

function getStarterPokemon(id) { //FIXME: change to return starter pokemon choose and save if it is shiny or not from generateStarterSelection function
  const starterPokemon = pokemonList[id]

  if(isShinyPokemon()) {
    starterPokemon.isShiny = true;
  }

  return starterPokemon;
}

function generateStarterSelection() { //FIXME: add shiny odds + emoji rendering here ✨
  //Embed
  const turtwigStarter = getStarterPokemon("TURTWIG")
  const chimcharStarter = getStarterPokemon("CHIMCHAR")
  const piplupStarter = getStarterPokemon("PIPLUP")
  const embed = new MessageEmbed().setTitle("Choose your Starter Pokemon");
  embed
    .addField(`${getPokemonString(turtwigStarter)}`, "**Type:** Grass", true)
    .addField(`${getPokemonString(chimcharStarter)}`, "**Type:** Fire", true)
    .addField(`${getPokemonString(piplupStarter)}`, "**Type:** Water", true);

  //Rows
  const rows = [new MessageActionRow().addComponents(new MessageButton().setCustomId("starter0").setLabel("Turtwig").setStyle("SECONDARY").setEmoji(getEmoji("TURTWIG", turtwigStarter.isShiny)), new MessageButton().setCustomId("starter1").setLabel("Chimchar").setStyle("SECONDARY").setEmoji(getEmoji("CHIMCHAR", chimcharStarter.isShiny)), new MessageButton().setCustomId("starter2").setLabel("Piplup").setStyle("SECONDARY").setEmoji(getEmoji("PIPLUP", piplupStarter.isShiny)))];

  return { message: { embeds: [embed], components: rows }, pokemons: [turtwigStarter, chimcharStarter, piplupStarter]};
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

function returnPokemonStats(stats) {
  let str = "";
  for (const [key, value] of Object.entries(stats)) {
    str += `${titleCase(key.split("-").join(" "))}: **${value}**\n`;
  }
  return str;
}

function returnPokemonMoves(moves) {
  let str = "";
  const filtered = moves.filter((move) => move?.selected);
  for (const move of filtered) {
    if (move.type === "status") {
      //str += `${move.name}: Healing: ${move.data.healing}\n`
    } else {
      str += `**${move.name}:** Type: ${titleCase(move.data.type)}, Accuracy: ${move.data.accuracy}, Power: ${move.data.power}\n`;
    }
  }
  return str;
}

function getPokemonLevel(xp) {
  let i = 1;
  let level = 0;
  let xpLeft = xp;
  while (xpLeft >= 0 && xpLeft - xpList[i] >= 0) {
    xpLeft = xpLeft - xpList[i];
    level++;
    i++;
  }
  return `${level}`;
}

async function getStorageRow(Game, int, id) {
  if (id === "pokemonStorage") {
    const rows = [new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Choose your Storage Page").setMinValues(1).setMaxValues(1).setCustomId("storageRowSelect"))];
    const storage = Game.profile.storage;
    rows[0].components[0].options.push({ label: "Back to Menu", emoji: { id:"977989090714714183" }, value: "backToMenu" })
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

async function displayPokemon(int, pokemon, state, id) {
  const pokemonEmbed = new MessageEmbed().setTitle(`Team Member info for ${pokemon.name} ${getPokemonString(pokemon)}`).setDescription(`Level: **${getPokemonLevel(pokemon.xp)}**\nTypes: **${pokemon.types.join(", ")}**`);
  pokemonEmbed.addField("Stats", `${returnPokemonStats(pokemon.stats)}`, true);
  pokemonEmbed.addField("Moves", `${returnPokemonMoves(pokemon.moves)}`, true);

  if (state === "withdraw") {
    const split = id.split("_");
    const rows = [new MessageActionRow().addComponents(new MessageButton().setLabel("Withdraw to Team").setCustomId(`withdrawPokemon_${split[1]}_${split[2]}`).setStyle("SUCCESS"))];
    return int.followUp({ embeds: [pokemonEmbed], components: rows, ephemeral: true });
  } else if(state === "deposit") {
    const rows = [new MessageActionRow().addComponents(new MessageButton().setLabel("Deposit to Storage").setCustomId(`depositPokemon_${id}`).setStyle("DANGER"))];
    return int.followUp({ embeds: [pokemonEmbed], components: rows, ephemeral: true });
  } else {
    return int.followUp({ embeds: [pokemonEmbed], ephemeral: true });
  }
}

async function withdrawPokemon(id, int, Game) {
  if (Game.profile.team.length === 6) {
    await int.followUp({ content: "You already have 6 Pokemon in your team, store one first so you have space in your team.", ephemeral: true });
  } else {
    const split = id.split("_");
    const page = split[1];
    const index = split[2];
    const pokemon = Game.profile.storage[page][index];
    Game.profile.team.push(pokemon);
    Game.profile.storage[page].splice(index, 1);
    await int.followUp({ content: `Successfully added ${pokemon.name} ${getEmoji(pokemon.name, pokemon.isShiny)} to the team.`, ephemeral: true });
    await Game.message.edit(getStorageRow(Game, int, "pokemonStorage"));
  }
}

async function depositPokemon(id, int, Game) {
  if(Game.profile.team.length === 1) return int.followUp({ content: `This action would remove your last pokemon from the team which will make you vulnerable to trainers.`, ephemeral: true });
  const index = id.split("_")[1];
  const pokemon = Game.profile.team[index];
  Game.profile.team.splice(index, 1);
  for(const [key, value] of Object.entries(Game.profile.storage)) {
    if(value.length < 50) {
      value.push(pokemon);
      await Game.message.edit(getPokemonTeamRow(Game.profile.team))
      return int.followUp({ content: `Successfully added ${pokemon.name} ${getEmoji(pokemon.name, pokemon.isShiny)} to Storage Page ${key}.`, ephemeral: true });
    }
  }
}

function isShinyPokemon() {
  const randomNumber = getRandomNumber(0, 4096)

  return randomNumber <= 1
}

function getPokemonString(pokemon) {
  let str = ""
  if(pokemon.isShiny) str += "✨ "
  str += `${pokemon.name} `
  str += getEmoji(pokemon.id, pokemon.isShiny)
  return str
}

module.exports = { getPokemonString, isShinyPokemon, depositPokemon, withdrawPokemon, displayPokemon, getStorageRow, returnPokemonMoves, getPokemonLevel, returnPokemonStats, getPokemonTeamRow, generateMenu, getEmoji, getOffset, handleMovement, generateMap, pokemonFound, generateRandomPokemon, generateProfileSelection, getStarterPokemon, generateStarterSelection };
