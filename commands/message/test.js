const { MessageEmbed } = require("discord.js");
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
      const img = await generatePokemonInfoImage(pokemonList["CHIMCHAR"]);
      message.channel.send({ embeds: [new MessageEmbed().setImage(img)] });
    }
  },
};
