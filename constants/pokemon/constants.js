/**
 * 0 = Player
 * 1 = Grass (No Pokemon)
 * 2 = Grass (Pokemon)
 * 3 = Water
 * 9 = Invis
 **/

const { MessageActionRow, MessageButton } = require("discord.js");

const emojis = {
  "0down": "<:ASH_DOWN:987629488064036884>",
  "0up": "<:ASH_UP_GRASS:987631282638979085>",
  "0left": "<:ASH_LEFT_GRASS:987631278536933427>",
  "0right": "<:ASH_RIGHT_GRASS:987631279874924634>",
  1: "<:GRASS:987633375537926184>",
  2: "<:GRASS_POKEMON:987635597516611654>",
  3: "<:WATER:987632979834712064>",
  9: "<:air:962820785666416730>",
};

const row1 = new MessageActionRow().addComponents(new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("x").setStyle("SECONDARY"), new MessageButton().setEmoji("🔼").setCustomId("up").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xx").setStyle("SECONDARY"));
const row2 = new MessageActionRow().addComponents(new MessageButton().setEmoji("◀️").setCustomId("left").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxx").setStyle("SECONDARY"), new MessageButton().setEmoji("▶️").setCustomId("right").setStyle("SECONDARY"));
const row3 = new MessageActionRow().addComponents(new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxxx").setStyle("SECONDARY"), new MessageButton().setEmoji("🔽").setCustomId("down").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxxxx").setStyle("SECONDARY"));
const rows = [row1, row2, row3];

const pokemonList = {};

module.exports = { emojis, rows, pokemonList };
