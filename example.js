import { Client, GatewayIntents } from "https://deno.land/x/harmony/mod.ts";
import { Manager } from "./mod.ts"; // replace './mod.ts' with 'https://deno.land/x/lavalink/mod.ts' or 'https://github.com/TheMaestro0/lavalink/blob/master/mod.ts'

const client = new Client();

client.music = new Manager({
    nodes: [{
        host: "localhost",
        // password: => default: youshallnotpass
        // port: => default: 2333
        // secure: => default: false
    }],
    autoPlay: true,
    send: (_, payload) => client.gateway.send(payload)
});

client.music
    .on("nodeConnect", node => console.log(`Node "${node.options.identifier}" connected.`))
    .on("nodeError", (node, error) => console.log(`Node "${node.options.identifier}" encountered an error: ${error.message}.`))
    .on("trackStart", (player, track) => client.channels.get(player.textChannel).then(channel => channel?.send(`Now playing: \`${track.title}\`, requested by \`${track.requester.tag}\`.`)))
    .on("queueEnd", (player) => {
        client.channels.get(player.textChannel).then(channel => channel?.send("Queue has ended."))
        player.destroy();
    });


client.on("raw", (evt, payload) => client.music.updateVoiceState(evt, payload));
client.once("ready", () => {
    client.music.init(client.user?.id);
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content.startsWith("!")) return;

    const args = message.content.slice(1).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();

    if (command === 'play') {

        const voice = await message.guild.voiceStates.get(message.author.id);

        if (!voice || !voice.channel) return message.reply("You need to join a voice channel.");
        if (!args[0]) return message.reply("You need to give me a URL or a search term.");

        const player = message.client.music.create({
            guild: message.guild.id,
            voiceChannel: voice.channel.id,
            textChannel: message.channel.id
        });

        if (player.state !== "CONNECTED") player.connect();

        let res;

        try {
            res = await player.search(args.join(" "), message.author);
            if (res.loadType === 'LOAD_FAILED') {
                if (!player.queue.current) player.destroy();
                throw res.exception;
            }
        } catch (err) {
            return message.reply(`There was an error while searching: ${err.message}`);
        }

        switch (res.loadType) {
            case 'NO_MATCHES':
                if (!player.queue.current) player.destroy();
                return message.reply('There were no results found.');
            case 'SEARCH_RESULT':
            case 'TRACK_LOADED':
                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused && !player.queue.size) player.play();
                return message.reply(`Enqueuing \`${res.tracks[0].title}\`.`);
            case 'PLAYLIST_LOADED':
                player.queue.add(res.tracks);
                if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
                return message.reply(`Enqueuing playlist \`${res.playlist.name}\` with ${res.tracks.length} tracks.`);
        }
    }
});

client.connect("your-token-here", [
    GatewayIntents.GUILD_VOICE_STATES,
    GatewayIntents.GUILDS,
    GatewayIntents.GUILD_MESSAGES,
]);