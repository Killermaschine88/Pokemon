const { returnTypes, returnStats, returnMoves } = require("./apiFunctions");
const { titleCase } = require("./functions");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");

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

  const emojiList = JSON.parse(fs.readFileSync(__dirname + "/../JSON/emojiList.json"));

  emojiList[name.toUpperCase()] = { normal: `<:${normalEmoji.name}:${normalEmoji.id}>`, shiny: `<:${shinyEmoji.name}:${shinyEmoji.id}>` };

  fs.writeFileSync(__dirname + "/../JSON/emojiList.json", JSON.stringify(emojiList, null, 2));

  await generatePokemonEntry(name.toLowerCase());
  client.channels.cache.get("989085658486292480").send(`Created <:${normalEmoji.name}:${normalEmoji.id}> <:${shinyEmoji.name}:${shinyEmoji.id}>, \`<:${normalEmoji.name}:${normalEmoji.id}>\` \`<:${shinyEmoji.name}:${shinyEmoji.id}>\``);
  return true;
}

async function generatePokemonEntry(name) {
  let obj = {};
  let list = JSON.parse(fs.readFileSync(__dirname + "/../JSON/pokemonList.json"));
  const pokemon = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)).data;
  obj["name"] = titleCase(name);
  obj["id"] = name.toUpperCase();
  obj["pokemonId"] = pokemon.id;
  obj["xp"] = 0;
  obj["types"] = returnTypes(pokemon.types);
  obj["stats"] = returnStats(pokemon.stats);
  obj["moves"] = await returnMoves(pokemon.moves);

  list[name.toUpperCase()] = obj;

  fs.writeFileSync(__dirname + "/../JSON/pokemonList.json", JSON.stringify(list));
}

module.exports = { generatePokemonEntry, uploadEmoji };
