const emojis = require("../../JSON/emojiList");
const { xpList } = require("../../JSON/xpList");
const { client } = require("../../../index");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

function getEmoji(name, shiny = false, way = "down") {
  if (!isNaN(name)) {
    if (name === 0) {
      if (emojis[name + way]) return emojis[name + way];
      else return emojis["MISSING_TEXTURE"];
    } else {
      if (emojis[name]) return emojis[name];
      else return emojis["MISSING_TEXTURE"];
    }
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

async function displayPokemon(int, pokemon, state, id) {
  const pokemonEmbed = new MessageEmbed().setTitle(`Team Member info for ${pokemon.name} ${getPokemonString(pokemon)}`).setDescription(`Level: **${getPokemonLevel(pokemon.xp)}**\nTypes: **${pokemon.types.join(", ")}**`);
  pokemonEmbed.addField("Stats", `${returnPokemonStats(pokemon.stats)}`, true);
  pokemonEmbed.addField("Moves", `${returnPokemonMoves(pokemon.moves)}`, true);

  if (state === "withdraw") {
    const split = id.split("_");
    const rows = [new MessageActionRow().addComponents(new MessageButton().setLabel("Withdraw to Team").setCustomId(`withdrawPokemon_${split[1]}_${split[2]}`).setStyle("SUCCESS"))];
    return int.followUp({ embeds: [pokemonEmbed], components: rows, ephemeral: true });
  } else if (state === "deposit") {
    const rows = [new MessageActionRow().addComponents(new MessageButton().setLabel("Deposit to Storage").setCustomId(`depositPokemon_${id}`).setStyle("DANGER"))];
    return int.followUp({ embeds: [pokemonEmbed], components: rows, ephemeral: true });
  } else {
    return int.followUp({ embeds: [pokemonEmbed], ephemeral: true });
  }
}

function emojiStringToId(emoji) {
  return emoji.split(":")[2].replace(">", "");
}

module.exports = { getEmoji, getPokemonLevel, getPokemonString, returnPokemonMoves, returnPokemonStats, displayPokemon, emojiStringToId };
