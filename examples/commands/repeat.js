/*
THIS IS JUST THE COMMAND IT SELF, IF YOU USE THIS EXACTLY THEN YOU WILL NEED A WAY TO LOAD THE FILE LIKE THE FOLLOWING HERE:
https://solaris.codes/erelajs/guides/moreCommands.html#before-you-start

YOU ALSO NEED TO INITIATE THE MANAGER AS SHOWN HERE:
https://solaris.codes/erelajs/guides/basics.html#first-start

Or copy the code inside the run function as its simply the message and arguments.
*/

export default {
  name: "repeat",
  run: async (message, args) => {
    const player = message.client.manager.get(message.guild.id);
    if (!player) return message.reply("there is no player for this guild.");

    const voice = await message.guild.voiceStates.get(message.author.id);

    if (!voice.channel) return message.reply("you need to join a voice channel.");
    if (voice.channel.id !== player.voiceChannel) return message.reply("you're not in the same voice channel.");

    if (args.length && /queue/i.test(args[0])) {
      player.setQueueRepeat(!player.queueRepeat);
      const queueRepeat = player.queueRepeat ? "enabled" : "disabled";
      return message.reply(`${queueRepeat} queue repeat.`);
    }

    player.setTrackRepeat(!player.trackRepeat);
    const trackRepeat = player.trackRepeat ? "enabled" : "disabled";
    return message.reply(`${trackRepeat} track repeat.`);
  }
}