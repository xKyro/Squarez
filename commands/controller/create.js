const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
  name: "create",
  category: "controller",
  description: "Ready? Create your first game and invite your friends!",
  aliases: [],
  cooldown: { time: 5, type: "s" },
  isBeta: false,
  run: async(bot, message, args) =>{
    
    let able = true

    const ingame_embed = new MessageEmbed()

    bot.games.forEach(game =>{
      if(game.gamePlayersJoined.includes(message.author.id)){
        ingame_embed.setDescription(`Oops!\nYou are already on a game, your current game is **${game.gameCode}**`)
        .setColor(bot.config.embed_color)
        .setTimestamp()
        .setFooter(`${bot.user.username}`)

        able = false
        return
      }
    })

    if(able === false) return message.channel.send(`> **In Game**`, ingame_embed)

    let gameCode = ""
    for(let i = 0; i < 7; i++){
      gameCode = gameCode + "abcdefghijklmnopqrstuvwxyz0123456789".toUpperCase().charAt(Math.floor(Math.random() * "abcdefghijklmnopqrstuvwxyz0123456789".length))
    }

    const creating_embed = new MessageEmbed()
    .setDescription(`__Sit down comfortable while I configure the game for you__`)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    const msg = await message.channel.send(`> **Creating..**`, creating_embed)

    if(bot.games.get(gameCode)) return message.channel.send(`> **Oops!**`, {
      embed:{
        description: `${bot.db.messages.err}\n> \`It seems that the code is already in use\``,
        color: bot.config.embed_color,
        timestamp: Date.now(),
        footer: { text: `${bot.user.username}`}
      }
    })

    await bot.games.set(gameCode, {
      gameLocHost: message.guild.id,
      gameHost: message.author.id,
      gamePlayers: 2,
      gameDuration: "5m",
      gamePowers: {
        enabled: "no",
        powers:[
          {
            name: "bomb",
            identifier: `<:sq_gridbomb:836362899299237898>`,
            instances: 0
          },
          {
            name: "lr",
            identifier: `<:sq_gridlr:836363037027467324>`,
            instances: 0
          },
          {
            name: "ud",
            identifier: `<:sq_gridud:836363125682339920>`,
            instances: 0
          }
        ]
      },
      gamePrivacy: "public",
      gameGridLength: 5,
      gamePlayersJoined: [
        message.author.id
      ],
      gameWinners: 1,
      gameCode: gameCode,
      gamePlaying: false
    })

    if(bot.games.get(gameCode)){
      msg.edit(`> **Done!**\n> Code: **${gameCode}**`, {
        embed:{
          description: `Your game has been created with the default values\nYou can now start modifying it as you like!`,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })
    }else{
      msg.edit(`> **Oops!**`, {
        embed:{
          description: `${bot.db.messages.err}`,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })
    }
  }
}