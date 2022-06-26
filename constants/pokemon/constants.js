const { MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");

const row1 = new MessageActionRow().addComponents(new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("x").setStyle("SECONDARY").setDisabled(true), new MessageButton().setEmoji("🔼").setCustomId("up").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xx").setStyle("SECONDARY").setDisabled(true));
const row2 = new MessageActionRow().addComponents(new MessageButton().setEmoji("◀️").setCustomId("left").setStyle("SECONDARY"), new MessageButton().setEmoji("<:menuicon:923000621370589254>").setCustomId("menu").setStyle("SECONDARY"), new MessageButton().setEmoji("▶️").setCustomId("right").setStyle("SECONDARY"));
const row3 = new MessageActionRow().addComponents(new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxxx").setStyle("SECONDARY").setDisabled(true), new MessageButton().setEmoji("🔽").setCustomId("down").setStyle("SECONDARY"), new MessageButton().setEmoji("<:air:962820785666416730>").setCustomId("xxxxx").setStyle("SECONDARY").setDisabled(true));
const rows = [row1, row2, row3];

const newProfileModal = new Modal()
  .setCustomId("newProfileModal")
  .setTitle("Profile Name")
  .addComponents(new MessageActionRow().addComponents(new TextInputComponent().setCustomId("name").setLabel("Your name for the Profile (min 5, max 25)").setStyle("SHORT").setMinLength(5).setMaxLength(25)));

const deleteProfileModal = new Modal()
  .setCustomId("deleteProfileModal")
  .setTitle("Profile Name")
  .addComponents(new MessageActionRow().addComponents(new TextInputComponent().setCustomId("name").setLabel("Profile Name to delete").setStyle("SHORT").setMinLength(5).setMaxLength(25)));

module.exports = { rows, newProfileModal, deleteProfileModal };
