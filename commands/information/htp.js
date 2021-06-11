const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
  name: "guide",
  category: "information",
  description: "Lost? You can see the How to Play guide and try it",
  aliases: ["htp"],
  isBeta: false,
  run: async(bot, message, args) =>{

    const embed = new MessageEmbed()
    .setDescription(`Hello there!\nThis is the _How to play_ Guide. Let's check it out together\n\n> Remember: **If you still have issues with the way of how to play, you can run the command ${bot.config.prefix}tutorial. A simple tutorial that will show you how to play the game!**`)
    .addFields(
      {name: "To move..", value: `You must specify where you want to move\n> If you want to move **UP**, type "up"\n> If you want to move **DOWN**, type "down"\n> If you want to move **LEFT**, type "left"\n> If you want to move **RIGHT**, type "right"\n\nWhen you move the player, the grid under will turn into the color of your player`},
      {name: "Elimination..", value: `If you ran out of grids with your color.. You will be _Eliminated_ and will no longer participate until the game ends`},
      {name: "Victory..", value: `You have a chance to win, make sure you eliminate every player from the round or have the most part of colored grids of your color until the timer is over!`}
    )
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    message.channel.send(`> **How to Play**`, embed)
  }
}