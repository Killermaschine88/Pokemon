async function createProfile(interaction, userOptions) {
  const res = await interaction.client.mongo.updateOne(
    { _id: interaction.user.id },
    {
      $set: {
        profiles: [],
      },
    },
    { upsert: true }
  );
  console.log(res);
}

module.exports = { createProfile };
