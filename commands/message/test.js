const { generatePokemonJSON } = require("../../constants/util/generators");

module.exports = {
  name: "test",
  devOnly: true,
  alias: [],
  async execute(message, args, client) {
    if (message.content === "json") {
      await generatePokemonJSON(message);
    }
  },
};
