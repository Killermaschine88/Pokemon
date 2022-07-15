const { generatePokemonInfoImage } = require("../../constants/pokemon/functions/canvasFunctions");
const { generatePokemonJSON } = require("../../constants/util/generators");
const pokemonList = require("../../constants/JSON/pokemonList.json");

module.exports = {
  name: "test",
  devOnly: true,
  alias: [],
  async execute(message, args, client) {
    if (message.content.includes("json")) {
      await generatePokemonJSON(message);
    }

    if (message.content.includes("pokemon")) {
      const pokemonImage = await generatePokemonInfoImage(pokemonList["LUGIA"]);
      console.log(pokemonImage)
      message.channel.send({ files: [{ attachment: pokemonImage, name: "test.gif" }] });
    }
  },
};
