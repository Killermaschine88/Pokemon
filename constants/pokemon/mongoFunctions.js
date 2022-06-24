async function createProfile(interaction, name, Game, starterPokemon) {
  if (await hasProfileWithName(interaction, name)) return interaction.followUp({ content: `Can't create another Profile with the name ${name} as a profile with that name already exists.`, ephemeral: true });
  await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $push: {
        profiles: {
          name: name,
          created: Math.floor(Date.now() / 1000),
          starterPokemon: starterPokemon.name,
          game: Game.getProfile(),
          pokemon_dollars: 0,
          team: [starterPokemon],
          items: [],
          //pokemons: [starterPokemon], // Figure out better way to handle for pc
        },
      },
    },
    { upsert: true }
  );
  const profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
  const profileId = profiles.indexOf(profiles.find((profile) => profile.name === name));
  return profileId;
}

async function hasProfileWithName(interaction, name) {
  const account = await interaction.client.mongo.findOne({ _id: interaction.user.id });

  if (!account) return false;
  return account.profiles.every((profile) => profile.name === name);
}

async function saveProfile(interaction, Game) {
  let profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
  profiles[Game.getProfileIndex()].game = Game.getProfile();
  await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $set: {
        profiles: profiles,
      },
    }
  );
}

module.exports = { createProfile, saveProfile };
