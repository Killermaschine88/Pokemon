const { emojis } = require("../JSON/emojiList");
const { pokemonList, pokemonNames } = require("../JSON/pokemonList");
const { rows } = require("./constants");
const { getRandomNumber } = require("../util/functions");
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");

function getEmoji(name, shiny = false, way = "down") {
  if (!isNaN(name)) {
    if(name === 0) return emojis[name + way];
    else return emojis[name];
  }

  if (shiny) return emojis[name.toUpperCase()].shiny;
  else return emojis[name.toUpperCase()].normal;
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
    const randomNum = getRandomNumber(100, false);

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
  const rn = getRandomNumber(100);
  return rn <= 5;
}

function generateRandomPokemon() {
  const pokemon = pokemonNames[Math.floor(Math.random() * pokemonNames.length)];
  return pokemonList[pokemon];
}

function generateProfileSelection(list) {
  //Embed
  const embed = new MessageEmbed().setTitle("Save Selection").setDescription("Choose a save you want to play.");
  if (list.length > 0) {
    for (const profile of list) {
      embed.addField(`${profile.name}`, `Starter: ${profile.starterPokemon} ${getEmoji(profile.starterPokemon)}\nPokemon Dollars: **${profile.pokemonDollars}**\nCreated: ${profile.created ? `<t:${profile.created}>` : "Unknown"}`, true);
    }
  } else {
    embed.setDescription("No Profiles found, please create a new one.");
  }

  //Components
  const row = new MessageActionRow();
  if (list.length > 0) {
    let index = 0;
    for (const profile of list) {
      row.components.push(new MessageButton().setCustomId(`${index}`).setLabel(`Load: ${profile.name}`).setStyle("SECONDARY"));
      index++;
    }
    if (row.components.length < 3) row.components.push(new MessageButton().setCustomId("newProfile").setLabel("Create new Profile").setStyle("SECONDARY"));
  } else {
    row.components.push(new MessageButton().setCustomId("newProfile").setLabel("Create new Profle").setStyle("SECONDARY"));
  }

  return { embeds: [embed], components: [row] };
}

function getStarterPokemon(id) {
  const starters = ["TURTWIG", "CHIMCHAR", "PIPLUP"];

  return pokemonList[starters[id]];
}

function generateStarterSelection() {
  const embed = new MessageEmbed().setTitle("Choose your Starter Pokemon");
  embed
    .addField(`${getEmoji("TURTWIG")} Turtwig`, "**Type:** Grass", true)
    .addField(`${getEmoji("CHIMCHAR")} Chimchar`, "**Type:** Fire", true)
    .addField(`${getEmoji("PIPLUP")} Piplup`, "**Type:** Water", true);

  const rows = [new MessageActionRow().addComponents(new MessageButton().setCustomId("starter0").setLabel("Turtwig").setStyle("SECONDARY").setEmoji(getEmoji("TURTWIG")), new MessageButton().setCustomId("starter1").setLabel("Chimchar").setStyle("SECONDARY").setEmoji(getEmoji("CHIMCHAR")), new MessageButton().setCustomId("starter2").setLabel("Piplup").setStyle("SECONDARY").setEmoji(getEmoji("PIPLUP")))];

  return { embeds: [embed], components: rows };
}

function generateMenu() {
  const rows = [new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Empty").setMinValues(1).setMaxValues(1).setCustomId("menuSelect"))];
  const options = [
    { label: "Back to Game", emoji: "977989090714714183", value: "movement" },
    { label: "Pokedex", emoji: "989794527952908328", value: "pokedex" },
    { label: "Pokemon", emoji: "989792754169167903", value: "pokemon" },
    { label: "Bag", emoji: "989794285002047518", value: "bag" },
    { label: "Save", emoji: "989807222051721216", value: "save" },
  ];

  for (const option of options) {
    rows[0].components[0].options.push({ label: option.label, value: option.value, emoji: { id: option.emoji } });
  }

  return { components: rows };
}

module.exports = { generateMenu, getEmoji, getOffset, handleMovement, generateMap, pokemonFound, generateRandomPokemon, generateProfileSelection, getStarterPokemon, generateStarterSelection };
