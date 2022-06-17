//Global Stuff
const { globalStart } = require("./constants/client/start");
globalStart();

//Discord Bot
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
  ws: {
    properties: {
      $browser: "Discord Android",
    },
  },
});

client.login(process.env.DISCORD_TOKEN);

//Imports
const fs = require("fs");

//Catch errors that might slip
try {
  process.on("uncaughtException", (error) => console.log(error));
  process.on("unhandledRejection", (error) => console.log(error));
} catch (e) {
  log(e.stack, "ERROR");
}

//Event Handler
const eventFiles = fs.readdirSync(__dirname + "/events").filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

//Loading Commands
loadCommands(client);

//Functions
function loadCommands(client) {
  client.messageCommands = new Discord.Collection();
  client.slashCommands = new Discord.Collection();

  if (fs.existsSync(__dirname + "/commands/message")) {
    const folder = fs.readdirSync(__dirname + "/commands/message");

    for (const file of folder) {
      const command = require(`./commands/message/${file}`);
      client.messageCommands.set(command.name.toLowerCase(), command);
    }
    log(`Loaded Message Commands`);
  }

  if (fs.existsSync(__dirname + "/commands/interaction")) {
    const folder = fs.readdirSync(__dirname + "/commands/interaction");

    for (const file of folder) {
      const command = require(`./commands/interaction/${file}`);
      client.slashCommands.set(command.name.toLowerCase(), command);
    }
    log(`Loaded Slash Commands`);
  }
}

client.reload = loadCommands;
