module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    //Slash Commands
    if (interaction.isCommand()) {
      let commandExecute = interaction.commandName;

      if (interaction.options.getSubcommand(false) != null) {
        commandExecute = interaction.commandName + interaction.options.getSubcommand(false);
      }

      const command = interaction.client.slashCommands.get(commandExecute);

      try {
        await interaction.deferReply({ ephemeral: command?.ephemeral ? true : false });
        await command.execute(interaction);
      } catch (e) {
        log(e.stack, "ERROR");
      }
    }
  },
};
