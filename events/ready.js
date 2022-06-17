const { commands } = require("../constants/client/commands");

module.exports = {
  name: "ready",
  async execute(client) {
    log(`Logged into Discord`);
    client.user.setActivity("with Pokemon", {
      type: "PLAYING",
    });

    //client.guilds.cache.get("944141746483372143").commands.set(commands)
  },
};
