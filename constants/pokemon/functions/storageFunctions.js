const { getStorageRow, getPokemonTeamRow } = require("./generatorFunctions");
const { getEmoji } = require("./utilFunctions");

async function withdrawPokemon(id, int, Game) {
  if (Game.profile.team.length === 6) {
    await int.followUp({ content: "You already have 6 Pokemon in your team, store one first so you have space in your team.", ephemeral: true });
  } else {
    const split = id.split("_");
    const page = split[1];
    const index = split[2];
    const pokemon = Game.profile.storage[page][index];
    Game.profile.team.push(pokemon);
    Game.profile.storage[page].splice(index, 1);
    await int.followUp({ content: `Successfully added ${pokemon.name} ${getEmoji(pokemon.name, pokemon.isShiny)} to the team.`, ephemeral: true });
    await Game.message.edit(getStorageRow(Game, int, "pokemonStorage"));
  }
}

async function depositPokemon(id, int, Game) {
  if (Game.profile.team.length === 1)
    return int.followUp({
      content: `This action would remove your last pokemon from the team which will make you vulnerable to trainers.`,
      ephemeral: true,
    });
  const index = id.split("_")[1];
  const pokemon = Game.profile.team[index];
  Game.profile.team.splice(index, 1);
  for (const [key, value] of Object.entries(Game.profile.storage)) {
    if (value.length < 50) {
      value.push(pokemon);
      await Game.message.edit(getPokemonTeamRow(Game.profile.team));
      return int.followUp({
        content: `Successfully added ${pokemon.name} ${getEmoji(pokemon.name, pokemon.isShiny)} to Storage Page ${key}.`,
        ephemeral: true,
      });
    }
  }
}

module.exports = { depositPokemon, withdrawPokemon };
