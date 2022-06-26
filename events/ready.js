const { commands } = require("../constants/client/commands");

module.exports = {
  name: "ready",
  async execute(client) {
    log(`Logged into Discord`);
    client.user.setActivity("with Pokemon", {
      type: "PLAYING",
    });

    //client.guilds.cache.get("990697176457941102").commands.set(commands)
  },
};
