const emojis = require("../../JSON/emojiList");
const { xpList } = require("../../JSON/xpList");
const { client } = require("../../../index");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { titleCase } = require("../../util/functions");

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

async function displayPokemon(int, pokemon, state, id) {
  const pokemonEmbed = new MessageEmbed()
    .setTitle(`Team Member info for ${pokemon.name} ${getPokemonString(pokemon)}`)
    .setDescription(`Level: **${getPokemonLevel(pokemon.xp)}**\nTypes: **${pokemon.types.join(", ")}**`);
  pokemonEmbed.addField("Stats", `${returnPokemonStats(pokemon.stats)}`, true);
  pokemonEmbed.addField("Moves", `${returnPokemonMoves(pokemon.moves)}`, true);

  if (state === "withdraw") {
    const split = id.split("_");
    const rows = [
      new MessageActionRow().addComponents(
        new MessageButton().setLabel("Withdraw to Team").setCustomId(`withdrawPokemon_${split[1]}_${split[2]}`).setStyle("SUCCESS")
      ),
    ];
    return int.followUp({ embeds: [pokemonEmbed], components: rows, ephemeral: true });
  } else if (state === "deposit") {
    const rows = [
      new MessageActionRow().addComponents(new MessageButton().setLabel("Deposit to Storage").setCustomId(`depositPokemon_${id}`).setStyle("DANGER")),
    ];
    return int.followUp({ embeds: [pokemonEmbed], components: rows, ephemeral: true });
  } else {
    return int.followUp({ embeds: [pokemonEmbed], ephemeral: true });
  }
}

function emojiStringToId(emoji) {
  return emoji.split(":")[2].replace(">", "");
}

function getRandomNature() {
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

module.exports = {
  getEmoji,
  getPokemonLevel,
  getPokemonString,
  returnPokemonMoves,
  returnPokemonStats,
  displayPokemon,
  emojiStringToId,
  getRandomNature,
  getXpUntilNextLevel,
};
