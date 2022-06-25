const { generatePokemonEntry, uploadEmoji } = require("../constants/util/emoji");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    if (message.channel.id === "989085658486292480") {
      try {
        await message.delete();

        //Get Emoji and Upload to guild
        await uploadEmoji(message.content, client);
      } catch (err) {
        await message.channel.send(`Something went wrong while uploading \`${message.content}\``);
        console.log(err);
      }
    }

    if (message.channel.id === "989956855419772928") {
      await message.delete();
      const res = await generatePokemonEntry(message.content);
      await message.channel.send(`Added information for ${message.content}`);
    }

    if (!message.content.startsWith(process.env.PREFIX || ".")) return;

    const args = message.content
      .slice(process.env.PREFIX || ".")
      .trim()
      .split(/ +/);
    const commandName = args
      .shift()
      .toLowerCase()
      .replace(process.env.PREFIX || ".", "");
    const command = client.messageCommands.get(commandName) || client.messageCommands.find((cmd) => cmd?.alias.includes(commandName));

    if (!command) return;

    if (command?.devOnly) {
      if (!client.application?.owner?.id) {
        await client.application.fetch();
      }
      if (message.author.id !== client.application?.owner?.id) {
        return message.channel.send("Only my developer is allowed to use this");
      }
    }

    await command.execute(message, args, client);
  },
};
