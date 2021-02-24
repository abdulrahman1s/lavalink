/*
THIS IS JUST THE COMMAND IT SELF, IF YOU USE THIS EXACTLY THEN YOU WILL NEED A WAY TO LOAD THE FILE LIKE THE FOLLOWING HERE:
https://solaris.codes/erelajs/guides/moreCommands.html#before-you-start

YOU ALSO NEED TO INITIATE THE MANAGER AS SHOWN HERE:
https://solaris.codes/erelajs/guides/basics.html#first-start

Or copy the code inside the run function as its simply the message and arguments.
*/

export default {
  name: 'play',
  run: async (message, args) => {
    const voice = await message.guild.voiceStates.get(message.author.id);

    if (!voice) return message.reply('you need to join a voice channel.');
    if (!args.length) return message.reply('you need to give me a URL or a search term.');

    const player = message.client.manager.create({
      guild: message.guild.id,
      voiceChannel: voice.channel.id,
      textChannel: message.channel.id,
    });

    if (player.state !== "CONNECTED") player.connect();

    const search = args.join(' ');
    let res;

    try {
      res = await player.search(search, message.author);
      if (res.loadType === 'LOAD_FAILED') {
        if (!player.queue.current) player.destroy();
        throw res.exception;
      }
    } catch (err) {
      return message.reply(`there was an error while searching: ${err.message}`);
    }

    switch (res.loadType) {
      case 'NO_MATCHES':
        if (!player.queue.current) player.destroy();
        return message.reply('there were no results found.');
      case 'SEARCH_RESULT':
      case 'TRACK_LOADED':
        player.queue.add(res.tracks[0]);

        if (!player.playing && !player.paused && !player.queue.size) player.play();
        return message.reply(`enqueuing \`${res.tracks[0].title}\`.`);
      case 'PLAYLIST_LOADED':
        player.queue.add(res.tracks);

        if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
        return message.reply(`enqueuing playlist \`${res.playlist.name}\` with ${res.tracks.length} tracks.`);
    }
  },
};
