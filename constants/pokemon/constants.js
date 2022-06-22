const { MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");

const row1 = new MessageActionRow().addComponents(new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("x").setStyle("SECONDARY"), new MessageButton().setEmoji("🔼").setCustomId("up").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xx").setStyle("SECONDARY"));
const row2 = new MessageActionRow().addComponents(new MessageButton().setEmoji("◀️").setCustomId("left").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxx").setStyle("SECONDARY"), new MessageButton().setEmoji("▶️").setCustomId("right").setStyle("SECONDARY"));
const row3 = new MessageActionRow().addComponents(new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxxx").setStyle("SECONDARY"), new MessageButton().setEmoji("🔽").setCustomId("down").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxxxx").setStyle("SECONDARY"));
const rows = [row1, row2, row3];

const newSaveModal = new Modal()
  .setCustomId("newSaveModal")
  .setTitle("Save Name")
  .addComponents(new MessageActionRow().addComponents(new TextInputComponent().setCustomId("name").setLabel("Your name for the Save (min 5, max 25)").setStyle("SHORT").setMinLength(5).setMaxLength(25)));

module.exports = { rows, newSaveModal };
