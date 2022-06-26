async function createProfile(interaction, name, Game, starterPokemon) {
  await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $push: {
        profiles: {
          // If adding anything here dont forget to add at constants/map.js getProfileForSave() Function
          game: Game, // Map Data
          name: name, // Name of the profile
          created: Math.floor(Date.now() / 1000), // Creation Date
          starterPokemon: starterPokemon.name, // Name of the starter Pokemon
          pokemonDollars: 0, // Amount of Money
          team: [starterPokemon], // Currently selected team
          bag: [], // Bag of Items (Pokeballs, etc)
          badges: [], // Gym Badges
          pokedex: [], // List of found Pokemon
          storage: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [], 13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [], 21: [], 22: [], 23: [] }, // Storage for exces pokemon
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
  //console.log(account)

  if (!account) return false;
  for (const profile of account.profiles) {
    if (profile.name === name) return true;
  }
  return false;
}

async function saveProfile(interaction, Game) {
  let profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id }))?.profiles || [];
  profiles[Game.getData("profileIndex")] = Game.getProfileForSave();
  await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $set: {
        profiles: profiles,
      },
    }
  );
}

async function getCurrentProfile(client, user, profileIndex) {
  const player = await client.mongo.findOne({ _id: user.id });
  return player.profiles[profileIndex];
}

async function deleteProfile(interaction, name) {
  const profiles = (await interaction.client.mongo.findOne({ _id: interaction.user.id })).profiles;
  let newProfiles = [];
  for (const profile of profiles) {
    if (profile.name !== name) newProfiles.push(profile);
  }

  await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $set: {
        profiles: newProfiles,
      },
    },
    { upsert: true }
  );
}

module.exports = { createProfile, saveProfile, getCurrentProfile, hasProfileWithName, deleteProfile };
