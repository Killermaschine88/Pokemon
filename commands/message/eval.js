const Discord = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "eval",
  devOnly: true,
  alias: ["ev", "e"],
  async execute(message, args, client) {
    if (message.author.id !== client.application?.owner.id) return;

    if (args.length === 0) {
      return message.channel.send({ embeds: [errEmbed("No args provided!")] });
    }

    const input = args.join(" ");

    (async () => {
      try {
        const evaled = await eval(`(async () => { return ${input} })().catch(e => { return "Error: " + e })`);

        const formattedResult = JSON.stringify(evaled, null, 4);
        const messageContent = `**Input**
			\`\`\`js\n${input}\n\`\`\`\n**Output**\n\`\`\`json\n${formattedResult}\n\`\`\``;
        await message.channel.send({
          content: messageContent.length > 2000 ? "Output too long to send, attached it" : messageContent,
          files: messageContent.length > 2000 ? [new Discord.MessageAttachment(Buffer.from("//Input\n" + input + "\n\n//Output\n" + formattedResult), "result.js")] : [],
        });
      } catch (err) {
        return message.channel.send({ embeds: [errEmbed(err.stack)] });
      }
    })();
  },
};

function errEmbed(msg) {
  const embed = new Discord.MessageEmbed().setTitle("Error!").setDescription(`\`\`\`\n${msg}\`\`\``).setColor("RED");

  return embed;
}
