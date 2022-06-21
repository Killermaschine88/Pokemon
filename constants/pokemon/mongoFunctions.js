async function createProfile(interaction, name, Game) {
  if (await hasProfileWithName(interaction, name)) return interaction.followUp({ content: `Can't create another Save with the name ${name} as a save with that name already exists.`, ephemeral: true });
  await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $push: {
        profiles: {
          name: name,
          game: Game,
          money: 0,
          team: [],
          items: [],
          pokemons: [],
        },
      },
    },
    { upsert: true }
  );
  const profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id})).profiles;
  const profileId = profiles.indexOf(profiles.find(profile => profile.name === name))
  return profileId;
}

async function hasProfileWithName(interaction, name) {
    const account = await interaction.client.mongo.findOne({ _id: interaction.user.id })

    if(!account) return false
    return account.profiles.every(profile => profile.name === name);
}

async function saveProfile(interaction, Game, profileIndex) {
  let profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id})).profiles;
  profiles[profileIndex].game = Game;
    await interaction.client.mongo.updateOne(
        { _id: interaction.user.id },
        { $set: {
            profiles: profiles
        }}
    )
}

module.exports = { createProfile, saveProfile };
