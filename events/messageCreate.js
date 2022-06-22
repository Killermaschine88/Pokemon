const sharp = require("sharp");
const axios = require("axios");

const guilds = ["944141746483372143"];

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    if (message.channel.id === "989085658486292480") {
      const split = message.content.split(" ");
      try {
        await message.delete();

        //Get Emoji and Upload to guild
        const emoji = await uploadEmoji(split, client);

        //Return result
        await message.channel.send(`Created <:${emoji.name}:${emoji.id}>, \`<:${emoji.name}:${emoji.id}>\``);
        client.channels.cache.get("989152766062649394").send(`<:${emoji.name}:${emoji.id}> \`${emoji.name}: "<:${emoji.name}:${emoji.id}>",\``);
      } catch (err) {
        await message.channel.send(`Something went wrong while uploading <${split[0]}> with name \`${split[1]}\``);
        console.log(err);
      }
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

async function uploadEmoji(split, client) {
  //Getting Random guild
  const guild = client.guilds.cache.get(guilds[Math.floor(Math.random() * guilds.length)]);

  //Getting Image Link
  const pokemon = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${split[0]}`)).data;

  // Fetch url and create buffer
  const buffer = await axios.get(pokemon.sprites.front_default, { responseType: "arraybuffer" });

  //Resize image
  const file = await sharp(buffer.data).trim(10).toBuffer({ resolveWithObject: true });

  //Upload emoji to discord
  const emoji = await guild.emojis.create(file.data, split[1].toUpperCase());

  return emoji;
}
