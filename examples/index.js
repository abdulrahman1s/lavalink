import { Client, Collection, GatewayIntents } from "https://deno.land/x/harmony/mod.ts";
import { Manager } from "../mod.ts"; // replace '../mod.ts' with 'https://deno.land/x/lavalink/mod.ts' or 'https://github.com/TheMaestro0/lavalink/blob/master/mod.ts'
import config from "./config.js";

const client = new Client();
client.commands = new Collection();
client.manager = new Manager({
  nodes: config.nodes,
  autoPlay: true,
  send: (_, payload) => client.gateway.send(payload)
});

for (const { name: path } of Deno.readDirSync("./commands")) {
  const command = (await import(`./commands/${path}`)).default;
  client.commands.set(command.name, command);
}


client.manager
  .on("nodeConnect", node => console.log(`Node "${node.options.identifier}" connected.`))
  .on("nodeError", (node, error) => console.log(`Node "${node.options.identifier}" encountered an error: ${error.message}.`))
  .on("trackStart", (player, track) => client.channels.get(player.textChannel).then(channel => channel?.send(`Now playing: \`${track.title}\`, requested by \`${track.requester.tag}\`.`)))
  .on("queueEnd", (player) => {
    client.channels.get(player.textChannel).then(channel => channel?.send("Queue has ended."))
    player.destroy();
  });


client.once("ready", () => {
  client.manager.init(client.user.id);
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("raw", (evt, payload) => client.manager.updateVoiceState(evt, payload));

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const [name, ...args] = message.content.slice(config.prefix.length).split(/\s+/);

  const command = client.commands.get(name);

  if (!command) return;

  try {
    command.run(message, args);
  } catch (err) {
    message.reply(`an error occurred while running the command: ${err.message}`);
  }
});

client.connect(config.token, [
  GatewayIntents.GUILD_VOICE_STATES,
  GatewayIntents.GUILDS,
  GatewayIntents.GUILD_MESSAGES,
]);