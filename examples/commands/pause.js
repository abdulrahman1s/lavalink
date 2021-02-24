/*
THIS IS JUST THE COMMAND IT SELF, IF YOU USE THIS EXACTLY THEN YOU WILL NEED A WAY TO LOAD THE FILE LIKE THE FOLLOWING HERE:
https://solaris.codes/erelajs/guides/moreCommands.html#before-you-start

YOU ALSO NEED TO INITIATE THE MANAGER AS SHOWN HERE:
https://solaris.codes/erelajs/guides/basics.html#first-start

Or copy the code inside the run function as its simply the message and arguments.
*/

export default {
  name: "pause",
  run: async (message) => {
    const player = message.client.manager.get(message.guild.id);
    if (!player) return message.reply("there is no player for this guild.");

    const voice = await message.guild.voiceStates.get(message.author.id);

    if (!voice) return message.reply("you need to join a voice channel.");
    if (voice.channel.id !== player.voiceChannel) return message.reply("you're not in the same voice channel.");
    if (player.paused) return message.reply("the player is already paused.");

    player.pause(true);
    return message.reply("paused the player.");
  }
}