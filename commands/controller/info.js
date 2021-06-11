const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
  name: "info",
  category: "controller",
  description: "See the information about the game you're in",
  aliases: [],
  isBeta: false,
  run: async(bot, message, args) =>{
    
    let able = false
    const nf_embed = new MessageEmbed()
    .setDescription(`${bot.db.messages.err}\n> \`You're not in a game\``)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    let gameCode = ""

    bot.games.forEach(game =>{
      if(game.gamePlayersJoined.includes(message.author.id)){
        able = true
        gameCode = game.gameCode
      }
    })

    if(able === false) return message.channel.send(`> **Oops!**`, nf_embed)

    let game = await bot.games.get(gameCode)

    const info_embed = new MessageEmbed()
    .setDescription(`You are checking out the information of the game **${game.gameCode}**\n\nIn this information you will see every configuration of the current game`)
    .addFields(
      {name: "Game Information", value: `Game Owner: **${message.guild.members.cache.get(game.gameHost).user.tag}**\nMax. Players: **${game.gamePlayers} players**\nCurrent Players:\n${game.gamePlayersJoined.map((p, i) => { return `> \`${i+1} | ${message.guild.members.cache.get(p).user.tag}\`` }).join("\n")}\nPowers: **${game.gamePowers.enabled}**${game.gamePowers.enabled === "yes" ? `\n${game.gamePowers.powers.map((power, i) => { return `> \`${i+1} | ${power.name} : ${power.instances}\`` }).join("\n")}`: ``}\nPrivacy: **${game.gamePrivacy}**\nGrid: **${game.gameGridLength}x${game.gameGridLength}**\nDuration: **${game.gameDuration}**\nMax. Winners: **${game.gameWinners}**`}
    )
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    message.channel.send(`> **Game Information**`, info_embed)
  }
}