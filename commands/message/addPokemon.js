const { addPokemonToUser } = require("../../constants/pokemon/functions/mongoFunctions");

module.exports = {
  name: "addPokemon",
  devOnly: true,
  alias: ["ap"],
  async execute(message, args, client) {
    if (args.length < 3) return message.channel.send("Correct usage: `.addPokemon PokemonName Shiny(True/False) ProfileId(1,2,3) UserId(Optional)`");
    const pokemonName = args[0].toUpperCase();
    const shiny = args[1].toLowerCase() === "true" ? true : false;
    const profileId = args[2];
    const userId = args[3] || message.author.id;

    await addPokemonToUser(pokemonName, shiny, profileId, userId, client);
    await message.channel.send("Done");
  },
};
