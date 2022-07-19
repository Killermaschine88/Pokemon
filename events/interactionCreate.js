const { InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    //Slash Commands
    if (interaction.type === InteractionType.ApplicationCommand) {
      const commandExecute = interaction.options.getSubcommand(false)
        ? (commandExecute = interaction.commandName + interaction.options.getSubcommand(false))
        : interaction.commandName;

      const command = interaction.client.slashCommands.get(commandExecute);

      try {
        await interaction.deferReply({ ephemeral: command?.ephemeral ? true : false });
        await command.execute(interaction);
      } catch (e) {
        log(e, "ERROR");
      }
    }
  },
};
