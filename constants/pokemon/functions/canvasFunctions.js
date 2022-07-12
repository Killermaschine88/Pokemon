const { createCanvas, loadImage, registerFont } = require("canvas");
const { INFO_BACKGROUND } = require("../constants/links.json");
const { getXpUntilNextLevel, getPokemonLevel } = require("./utilFunctions");

async function generatePokemonInfoImage(pokemon) {
  // Generate Canvas
  const canvas = createCanvas(400, 300);
  const ctx = canvas.getContext("2d");

  // Setting background
  ctx.drawImage(await loadImage(INFO_BACKGROUND), 0, 0);

  // Setting font and size https://github.com/castdrian/team-preview/blob/main/data/font/OpenSans-Semibold.ttf
  const pokemonFont = registerFont("./constants/pokemon/constants/OpenSans-Semibold.ttf", { family: "OpenSans-Semibold" });
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
  for(const [key, value] of Object.entries(pokemon.iv)) {
    if(value > 20) ctx.fillStyle = "green"
    else ctx.fillStyle = "red";
    ctx.fillText(`${value}`, 100, ivY);
    ivY += 16;
  }

  // Name
  ctx.fillStyle = "white";
  ctx.fillText(`${pokemon.name}`, 150, 24);

  // Level
  ctx.fillText(`Lvl. ${getPokemonLevel(pokemon.xp)}`, 350, 24);

  // Pokemon Image
  ctx.drawImage(await loadImage(pokemon.isShiny ? pokemon.sprites.front.shiny : pokemon.sprites.front.normal), 200, 30, 135, 135);

  // Return finished image
  return canvas.toBuffer();
}

module.exports = { generatePokemonInfoImage };
