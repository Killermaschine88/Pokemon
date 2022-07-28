const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ButtonStyle } = require("discord.js");

const row1 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setEmoji("<:air:962820785666416730>").setCustomId("x").setStyle(ButtonStyle.Secondary).setDisabled(true),
  new ButtonBuilder().setEmoji("🔼").setCustomId("up").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setEmoji("<:air:962820785666416730>").setCustomId("xx").setStyle(ButtonStyle.Secondary).setDisabled(true)
);
const row2 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setEmoji("◀️").setCustomId("left").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setEmoji("<:menuicon:923000621370589254>").setCustomId("menu").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setEmoji("▶️").setCustomId("right").setStyle(ButtonStyle.Secondary)
);
const row3 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setEmoji("<:air:962820785666416730>").setCustomId("xxxx").setStyle(ButtonStyle.Secondary).setDisabled(true),
  new ButtonBuilder().setEmoji("🔽").setCustomId("down").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setEmoji("<:air:962820785666416730>").setCustomId("xxxxx").setStyle(ButtonStyle.Secondary).setDisabled(true)
);
const rows = [row1, row2, row3];

const newProfileModal = new ModalBuilder()
  .setCustomId("newProfileModalBuilder")
  .setTitle("Profile Name")
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Your name for the Profile (min 5, max 25)")
        .setStyle("Short")
        .setMinLength(5)
        .setMaxLength(25)
    )
  );

const deleteProfileModal = new ModalBuilder()
  .setCustomId("deleteProfileModalBuilder")
  .setTitle("Profile Name")
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("name").setLabel("Profile Name to delete").setStyle("Short").setMinLength(5).setMaxLength(25)
    )
  );

module.exports = { rows, newProfileModal, deleteProfileModal };
