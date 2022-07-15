const { generatePokemonEntry } = require("./emoji");

// Last with Sprites https://pokeapi.co/api/v2/pokemon/651
async function generatePokemonJSON(message) {
  const pokemonAmount = 651;

  await message.channel.send(`Started generating the JSON for ${pokemonAmount} Pokemon`);

  const b4 = Math.floor(Date.now() / 1000);
  for (let i = 1; i <= pokemonAmount; i++) {
    await generatePokemonEntry(i);
    console.log(`Finished pokemon ${i}/${pokemonAmount}`);
  }

  await message.channel.send(`<t:${b4}:R>`);
}

module.exports = { generatePokemonJSON };
