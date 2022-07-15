const emojis = require("../../JSON/emojiList");
const { xpList } = require("../../JSON/xpList");
const { client } = require("../../../index");
const { titleCase, getRandomNumber } = require("../../util/functions");

function getEmoji(name, shiny = false) {
  if (!isNaN(name.toString().charAt(0))) {
    //if (name === 0) {
    if (emojis[name]) return emojis[name];
    else return emojis["MISSING_TEXTURE"];
    // }
  }

  name = name.toUpperCase();

  if (!emojis[name]) {
    client.channels.cache.get("990697665719316510").send(`Missing emoji for ${name}`);
    return emojis["MISSING_TEXTURE"];
  }

  if (shiny) return emojis[name].shiny;
  else return emojis[name].normal;
}

function getPokemonString(pokemon) {
  let str = "";
  if (pokemon.isShiny) str += "✨ ";
  str += `${pokemon.name} `;
  str += getEmoji(pokemon.id, pokemon.isShiny);
  return str;
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

function getXpUntilNextLevel(xp) {
  let i = 1;
  let level = 0;
  let xpLeft = xp;
  while (xpLeft >= 0 && xpLeft - xpList[i] >= 0) {
    xpLeft = xpLeft - xpList[i];
    level++;
    i++;
  }
  if (level === 100) return "MAX";
  else return `${xpList[level + 1] - xpLeft}`;
}

function emojiStringToId(emoji) {
  return emoji.split(":")[2].replace(">", "");
}

function generateRandomNature() {
  // https://bulbapedia.bulbagarden.net/wiki/Nature
  const natures = [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Bold",
    "Docile",
    "Relaxed",
    "Impish",
    "Lax",
    "Timid",
    "Hasty",
    "Serious",
    "Jolly",
    "Naive",
    "Modest",
    "Mild",
    "Quiet",
    "Bashful",
    "Rash",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful",
    "Quirky",
  ];

  return natures[Math.floor(Math.random() * natures.length)];
}

function generateRandomIV() {
  return {
    hp: getRandomNumber(0, 31),
    attack: getRandomNumber(0, 31),
    defense: getRandomNumber(0, 31),
    "special-attack": getRandomNumber(0, 31),
    "special-defense": getRandomNumber(0, 31),
    speed: getRandomNumber(0, 31),
  };
}
//"stats": { "hp": 106, "attack": 90, "defense": 130, "special-attack": 90, "special-defense": 154, "speed": 110 },

module.exports = {
  getEmoji,
  getPokemonLevel,
  getPokemonString,
  returnPokemonMoves,
  returnPokemonStats,
  emojiStringToId,
  generateRandomNature,
  getXpUntilNextLevel,
  generateRandomIV,
};
