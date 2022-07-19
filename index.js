//Global Stuff
const { globalStart } = require("./constants/client/start");
globalStart();

//Discord Bot
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.login(process.env.DISCORD_TOKEN);
module.exports = { client };

//Mongo DB
const { connectMongo } = require("./constants/client/mongo");
const MongoClient = connectMongo();
client.mongo = MongoClient.db("Pokemon").collection("Profiles");

//Imports
const fs = require("fs");

//Catch errors that might slip
process.on("uncaughtException", (error) => console.error(error));
process.on("unhandledRejection", (error) => console.error(error));

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
  client.messageCommands = new Collection();
  client.slashCommands = new Collection();

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
