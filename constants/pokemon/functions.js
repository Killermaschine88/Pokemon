const { emojis, pokemonList, pokemonNames } = require("./constants");
const { getRandomNumber } = require("../util/functions");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

function getEmoji(name, way = "down") {
  if (name === 0) return emojis[name + way];
  else return emojis[name];
}

function updateEmbed(Game, embed, reply) {
  //If Pokemon spawned
  if (Game.pokemonSpawned()) {
  }

  //If no pokemon spawned
  embed.setDescription(Game.renderMap());
  reply.edit(reply, { embeds: [embed] });
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
  const move = game.map[game.pos.y + y][game.pos.x + x];

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

function generateSaveSelection(list) {
  //Embed
  const embed = new MessageEmbed().setTitle("Save Selection").setDescription("Choose a save you want to play.");
  if (list.length > 0) {
    for (const save of list) {
      embed.addField(`${save.name}`, `Pokemon: **${save.pokemons.length}**\nMoney: **${save.money}**\nCreated: ${save.create ? `<t:${save.created}:>` : "Unknown"}`, true);
    }
  } else {
    embed.setDescription("No Saves found, please create a new one.");
  }

  //Components
  const row = new MessageActionRow();
  if (list.length > 0) {
    let index = 0;
    for (const save of list) {
      row.components.push(new MessageButton().setCustomId(`${index}`).setLabel(`Load: ${save.name}`).setStyle("SECONDARY"));
      index++;
    }
    if (row.components.length < 3) row.components.push(new MessageButton().setCustomId("newSave").setLabel("Create new Save").setStyle("SECONDARY"));
  } else {
    row.components.push(new MessageButton().setCustomId("newSave").setLabel("Create new Save").setStyle("SECONDARY"));
  }

  return { embeds: [embed], components: [row] };
}

function getStarterPokemon(id) {
  const starters = ["TURTWIG", "CHIMCHAR", "PIPLUP"];

  return pokemonList[starters[id]];
}

function generateStarterSelection() {
  const embed = new MessageEmbed().setTitle("Choose your Starter Pokemon").setThumbnail("https://cdn.discordapp.com/attachments/989252216600801311/989252461300682882/hornyProfessor.png");
  embed
    .addField(`${getEmoji("TURTWIG")} Turtwig`, "Type: Earth", true)
    .addField(`${getEmoji("CHIMCHAR")} Chimchar`, "Type: Fire", true)
    .addField(`${getEmoji("PIPLUP")} Piplup`, "Type: Water", true);

  const rows = [new MessageActionRow().addComponents(new MessageButton().setCustomId("starter0").setLabel("Turtwig").setStyle("SECONDARY").setEmoji(getEmoji("TURTWIG")), new MessageButton().setCustomId("starter1").setLabel("Chimchar").setStyle("SECONDARY").setEmoji(getEmoji("CHIMCHAR")), new MessageButton().setCustomId("starter2").setLabel("Piplup").setStyle("SECONDARY").setEmoji(getEmoji("PIPLUP")))];

  return { embeds: [embed], components: rows };
}

module.exports = { getEmoji, updateEmbed, getOffset, handleMovement, generateMap, pokemonFound, generateRandomPokemon, generateSaveSelection, getStarterPokemon, generateStarterSelection };
