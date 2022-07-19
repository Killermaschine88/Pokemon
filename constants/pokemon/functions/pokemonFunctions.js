const { getRandomNumber } = require("../../util/functions");
const pokemonList = require("../../JSON/pokemonList.json");
const { ignoredPokemon } = require("../constants/pokemon");
const { generateRandomNature, generateRandomIV } = require("./utilFunctions");
const { generatePokemonInfoImage } = require("./canvasFunctions");
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

function pokemonFound() {
  return getRandomNumber(0, 10) <= 5; //FIXME: Change 10 to 100 again later for 5% chance
}

function generateRandomPokemon() {
  let pokemonNames = Object.keys(pokemonList);
  pokemonNames = pokemonNames.filter((pokemon) => !ignoredPokemon.includes(pokemon));
  const pokemon = pokemonList[pokemonNames[Math.floor(Math.random() * pokemonNames.length)]];
  if (isShinyPokemon()) pokemon.isShiny = true;
  pokemon.iv = generateRandomIV();
  pokemon.nature = generateRandomNature();
  return pokemon;
}

function getStarterPokemon(id) {
  const starterPokemon = pokemonList[id];

  if (isShinyPokemon()) {
    starterPokemon.isShiny = true;
  }

  starterPokemon.nature = generateRandomNature();
  starterPokemon.iv = generateRandomIV();

  return starterPokemon;
}

function isShinyPokemon() {
  return getRandomNumber(0, 4096) <= 1;
}

async function displayPokemon(int, pokemon, state, id) {
  const msg = await int.followUp({ content: "Generating stats image...", ephemeral: true });
  const image = await generatePokemonInfoImage(pokemon);

  if (state === "withdraw") {
    const split = id.split("_");
    const rows = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("Withdraw to Team").setCustomId(`withdrawPokemon_${split[1]}_${split[2]}`).setStyle("Success")
      ),
    ];
    return int.followUp({ files: [image], components: rows, ephemeral: true });
  } else if (state === "deposit") {
    const rows = [
      new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Deposit to Storage").setCustomId(`depositPokemon_${id}`).setStyle("Danger")),
    ];
    return int.followUp({ files: [image], components: rows, ephemeral: true });
  } else {
    return int.followUp({ files: [image], ephemeral: true });
  }
}

module.exports = { pokemonFound, generateRandomPokemon, isShinyPokemon, getStarterPokemon, displayPokemon };
