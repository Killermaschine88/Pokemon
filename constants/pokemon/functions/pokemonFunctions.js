const { getRandomNumber } = require("../../util/functions");
const pokemonList = require("../../JSON/pokemonList.json");
const { ignoredPokemon } = require("../constants/pokemon");
const { getRandomNature } = require("./utilFunctions");
const { generatePokemonInfoImage } = require("./canvasFunctions")
const { MessageActionRow, MessageButton } = require("discord.js");

function pokemonFound() {
  return getRandomNumber(0, 10) <= 5; //FIXME: Change 10 to 100 again later for 5% chance
}

function generateRandomPokemon() {
  let pokemonNames = Object.keys(pokemonList);
  pokemonNames = pokemonNames.filter((pokemon) => !ignoredPokemon.includes(pokemon));
  const pokemon = pokemonNames[Math.floor(Math.random() * pokemonNames.length)];
  if (isShinyPokemon()) pokemon.isShiny = true;
  pokemon.nature = getRandomNature();
  return pokemonList[pokemon];
}

function getStarterPokemon(id) {
  const starterPokemon = pokemonList[id];

  if (isShinyPokemon()) {
    starterPokemon.isShiny = true;
  }

  starterPokemon.nature = getRandomNature();

  return starterPokemon;
}

function isShinyPokemon() {
  return getRandomNumber(0, 4096) <= 1;
}

async function displayPokemon(int, pokemon, state, id) {
  const image = await generatePokemonInfoImage(pokemon)

  if (state === "withdraw") {
    const split = id.split("_");
    const rows = [
      new MessageActionRow().addComponents(
        new MessageButton().setLabel("Withdraw to Team").setCustomId(`withdrawPokemon_${split[1]}_${split[2]}`).setStyle("SUCCESS")
      ),
    ];
    return int.followUp({ files: [image], components: rows, ephemeral: true });
  } else if (state === "deposit") {
    const rows = [
      new MessageActionRow().addComponents(new MessageButton().setLabel("Deposit to Storage").setCustomId(`depositPokemon_${id}`).setStyle("DANGER")),
    ];
    return int.followUp({ files: [image], components: rows, ephemeral: true });
  } else {
    return int.followUp({ files: [image], ephemeral: true });
  }
}

module.exports = { pokemonFound, generateRandomPokemon, isShinyPokemon, getStarterPokemon, displayPokemon };
