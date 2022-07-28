const { Canvas, loadImage, FontLibrary } = require("skia-canvas");
const { INFO_BACKGROUND } = require("../constants/links.json");
const { getXpUntilNextLevel, getPokemonLevel } = require("./utilFunctions");
const GIFEncoder = require("gifencoder");
const gifFrames = require("gif-frames");
const { tmpdir } = require("os");
const { writeFile } = require("fs/promises");
const { createWriteStream } = require("fs");

async function generatePokemonInfoImage(pokemon) {
  const b4 = Date.now();
  // Generate Canvas
  const canvas = new Canvas(400, 300);
  const ctx = canvas.getContext("2d");

  // Setting background
  ctx.drawImage(await loadImage(INFO_BACKGROUND), 0, 0);

  // Setting font and size https://github.com/castdrian/team-preview/blob/main/data/font/OpenSans-Semibold.ttf
  FontLibrary.use("pokemonFont", "./constants/pokemon/constants/OpenSans-Semibold.ttf");
  ctx.font = "10px pokemonFont";

  // Placing pokemon info

  // Nature
  ctx.fillStyle = "yellow";
  ctx.fillText(`${pokemon.nature || "Unknown"}`, 151, 205);

  // Held Item
  ctx.fillText(`${pokemon.heldItem || "None"}`, 151, 241);

  // XP till next level
  ctx.fillText(`${getXpUntilNextLevel(pokemon.xp)} XP`, 151, 276);

  // Moves
  let movesY = 203;
  for (const move of pokemon.moves.filter((move) => move.selected)) {
    ctx.fillText(`${move.name}`, 20, movesY);
    movesY += 14;
  }

  // Stats and IV

  /* Stats */
  ctx.fillStyle = "white";
  let statsY = 75;
  for (const [key, value] of Object.entries(pokemon.stats)) {
    ctx.fillText(`${value}`, 57, statsY);
    statsY += 16;
  }

  /* IV */
  let ivY = 75;
  for (const [key, value] of Object.entries(pokemon.iv)) {
    if (value > 20) ctx.fillStyle = "green";
    else ctx.fillStyle = "red";
    ctx.fillText(`${value}`, 100, ivY);
    ivY += 16;
  }

  // Name
  ctx.fillStyle = "white";
  ctx.fillText(`${pokemon.name}`, 150, 24);

  // Level
  ctx.fillText(`Lvl. ${getPokemonLevel(pokemon.xp)}`, 350, 24);

  // Types
  ctx.fillText("Types", 20, 262);
  let typeX = 20;
  for (const type of pokemon.types) {
    ctx.drawImage(await loadImage(`https://play.pokemonshowdown.com/sprites/types/${type}.png`), typeX, 267);
    typeX += 35;
  }

  // Pokemon Image
  const test = false;
  if (test) {
    const imageUrl = pokemon.isShiny
      ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemon.name.toLowerCase()}.gif`
      : `https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase()}.gif`;
    const buffer = await canvas.toBuffer("png");

    return generateGIF(buffer, imageUrl);
  } else {
    ctx.drawImage(await loadImage(pokemon.isShiny ? pokemon.sprites.front.shiny : pokemon.sprites.front.normal), 200, 30, 135, 135);
    return canvas.toBuffer("png");
  }
}

async function generateGIF(buffer, url) {
  const filename = `${tmpdir()}/${Math.random().toString()}_n.png`;
  await writeFile(filename, buffer);
  const gif = await gifFrames({ url, frames: "all", outputType: "png" });

  const images = await Promise.all(
    gif.map((img, index) => {
      const file = filename.replace("_n", `_${index}`);
      const stream = createWriteStream(file);
      img.getImage().pipe(stream);
      return new Promise((res) => stream.on("finish", () => res(file)));
    })
  );

  const GIF = new GIFEncoder(400, 300);
  GIF.start();
  GIF.setRepeat(0);
  GIF.setDelay(50);

  for (const image of images) {
    const canvas = new Canvas(400, 300);
    const bg = await loadImage(filename);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(await loadImage(image), 200, 30);
    GIF.addFrame(ctx);
  }

  GIF.finish();

  return GIF.out.getData();
}

module.exports = { generatePokemonInfoImage };
