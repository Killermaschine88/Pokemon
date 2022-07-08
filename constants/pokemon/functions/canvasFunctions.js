const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { client } = require("../../../index");

async function generatePokemonInfoImage(pokemon) {
  // Generate Canvas
  const canvas = createCanvas(400, 250);
  const ctx = canvas.getContext("2d");
  const backgroundImage = await loadImage("https://cdn.discordapp.com/attachments/994583614786371635/994936023157063730/infoBackground.png");
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  const pokemonImage = await loadImage(`${pokemon.isShiny ? pokemon.sprites.front.shiny : pokemon.sprites.front.normal}`);
  ctx.drawImage(pokemonImage, 50, 50, 100, 100);

  // Get Image Link
  const imageLink = (await client.channels.cache.get("994856840959643709").send({ files: [canvas.toBuffer()] })).attachments.first().url;

  return imageLink;
}

module.exports = { generatePokemonInfoImage };
