const sharp = require("sharp");
const axios = require("axios");
const { returnTypes, returnStats, returnMoves } = require("../constants/util/apiFunctions");
const { titleCase } = require("../constants/util/functions");
const fs = require("fs");

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
        await message.channel.send(`Something went wrong while uploading \`${split[0]}\``);
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

async function uploadEmoji(input, client) {
  //Misc
  const guilds = ["944141746483372143"];
  let url = input;
  let name = input;

  //Getting Random guild
  const guild = client.guilds.cache.get(guilds[Math.floor(Math.random() * guilds.length)]);

  //Getting Image Link
  let pokemon = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${url}`)).data;

  let normalPokemon = pokemon.sprites.front_default;
  let shinyPokemon = pokemon.sprites.front_shiny;

  // Fetch url and create buffer
  const normalBuffer = await axios.get(normalPokemon, { responseType: "arraybuffer" });
  const shinyBuffer = await axios.get(shinyPokemon, { responseType: "arraybuffer" });

  //Resize image
  const normalFile = await sharp(normalBuffer.data).trim(10).toBuffer({ resolveWithObject: true });
  const shinyFile = await sharp(shinyBuffer.data).trim(10).toBuffer({ resolveWithObject: true });

  //Upload emoji to discord
  const normalEmoji = await guild.emojis.create(normalFile.data, `${name.toUpperCase()}_NORMAL`);
  const shinyEmoji = await guild.emojis.create(shinyFile.data, `${name.toUpperCase()}_SHINY`);

  const emojiList = JSON.parse(fs.readFileSync(__dirname + "/../constants/JSON/emojiList.json"));

  emojiList[name.toUpperCase()] = { normal: `<:${normalEmoji.name}:${normalEmoji.id}>`, shiny: `<:${shinyEmoji.name}:${shinyEmoji.id}>` };

  fs.writeFileSync(__dirname + "/../constants/JSON/emojiList.json", JSON.stringify(emojiList, null, 2));

  client.channels.cache.get("989085658486292480").send(`Created <:${normalEmoji.name}:${normalEmoji.id}> <:${shinyEmoji.name}:${shinyEmoji.id}>, \`<:${normalEmoji.name}:${normalEmoji.id}>\` \`<:${shinyEmoji.name}:${shinyEmoji.id}>\``);
  return true;
}

async function generatePokemonEntry(name) {
  let obj = {};
  let list = JSON.parse(fs.readFileSync(__dirname + "/../constants/JSON/pokemonList.json"));
  const pokemon = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)).data;
  obj["name"] = titleCase(name);
  obj["id"] = name.toUpperCase();
  obj["pokemonId"] = pokemon.id;
  obj["xp"] = 0;
  obj["types"] = returnTypes(pokemon.types);
  obj["stats"] = returnStats(pokemon.stats);
  obj["moves"] = await returnMoves(pokemon.moves);

  list[name.toUpperCase()] = obj;

  fs.writeFileSync(__dirname + "/../constants/JSON/pokemonList.json", JSON.stringify(list));
}

module.exports = { uploadEmoji };
