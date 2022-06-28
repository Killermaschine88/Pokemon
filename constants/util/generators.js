const { generatePokemonEntry } = require("./emoji");

async function generatePokemonJSON(message) {
  const b4 = Math.floor(Date.now() / 1000);
  for (let i = 1; i <= 493; i++) {
    await generatePokemonEntry(i);
    console.log(`Finished pokemon ${i}/493`);
  }

  await message.channel.send(`<t:${b4}:R>`);
}

module.exports = { generatePokemonJSON };
