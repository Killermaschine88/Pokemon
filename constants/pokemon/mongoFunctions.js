async function createProfile(interaction, userOptions) {
  await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $set: {
        profiles: [],
      },
    },
    { upsert: true }
  );
  return true;
}

module.exports = { createProfile };
