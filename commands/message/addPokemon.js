const { getEmoji } = require("../../constants/pokemon/functions/utilFunctions")
const { addPokemonToUser } = require("../../constants/pokemon/functions/mongoFunctions")

module.exports = {
    name: "addPokemon",
    devOnly: true,
    alias: [],
    async execute(message, args, client) {
        const split = message.content.split(" ");
        if(split.length <= 3) return message.channel.send("Correct usage: `.addPokemon PokemonName Shiny(True/False) ProfileId(1,2,3) UserId(Optional)`");
        const pokemonName = split[0].toUpperCase();
        const shiny = split[1].toLowerCase() === "true" ? true : false;
        const profileId = split[2]
        const userId = split[3] || message.author.id

        await addPokemonToUser(pokemonName, shiny, profileId, userId, client)
    }
}