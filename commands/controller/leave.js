const {MessageEmbed} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
module.exports={
  name: "leave",
  category: "controller",
  description: "Leave the game, if you're done for now",
  aliases: [],
  cooldown: { time: 5, type: "s" },
  isBeta: false,
  run: async(bot, message, args) =>{
    
    let gameCode = ""
    bot.games.forEach(game =>{
        if(game.gamePlayersJoined.includes(message.author.id)) gameCode = game.gameCode
    })

    const leaveButton = new MessageButton()
    .setStyle(`red`)
    .setLabel("Leave")
    .setID("leave-game-button")

    const stayButton = new MessageButton()
    .setStyle(`blurple`)
    .setLabel("Stay")
    .setID("stay-game-button")

    const leaveActions = new MessageActionRow()
    .addComponent(stayButton)
    .addComponent(leaveButton)

    // const buttons = [stayButton, leaveButton]

    const game = bot.games.get(gameCode)

    if(!game) return message.channel.send(`> **Oops!**`, {
        embed:{
            description: `${bot.db.messages.err}\n> \`You're not in a game\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: `${bot.user.username}`}
        }
    })

    const msg = await message.channel.send(`> **Are you sure?**`, {
        embed:{
            description: `Are you want to quit the game **${gameCode}**\nYou'll be still able to join back anytime you want, unless, the game were deleted`,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: `${bot.user.username}` }
        },
        component: leaveActions
    })

    let filter = (button) => button.clicker.user.id === message.author.id
    const collector = msg.createButtonCollector(filter)
    collector.on("collect", async(button) =>{

        button.defer()

        if(button.id === "leave-game-button"){
            let newPlayers = []
            game.gamePlayersJoined.forEach(pl =>{
                if(pl !== message.author.id) newPlayers.push(pl)
            })
            bot.games.get(gameCode).gamePlayersJoined = newPlayers

            await msg.delete().catch(err => { if(err) message.channel.send(`> **Oops!**`, {
              embed:{
                description: `${bot.db.messages.err}\n> \`I don't have the permission to delete messages, cannot afford the command\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer:{
                  text: bot.user.username
                }
              }
            }) })

            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `You just left the game **${gameCode}**${game.gameHost === message.author.id && game.gamePlayersJoined.length > 0 ? `\nThe host of the has left, a new host has been selected\n` : ``}\n> Players: ${bot.games.get(gameCode).gamePlayersJoined.length}${game.gamePlayersJoined <= 0 ? `\n\nThe game will be deleted cuz there are no players` : ``}`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            if(game.gameHost === message.author.id) bot.games.get(gameCode).gameHost = game.gamePlayersJoined[Math.floor(Math.random() * game.gamePlayersJoined.length)]
            if(game.gamePlayersJoined.length <= 0) bot.games.delete(gameCode)
        }
        if(button.id === "stay-game-button"){
            await msg.delete().catch(err => { if(err) message.channel.send(`> **Oops!**`, {
              embed:{
                description: `${bot.db.messages.err}\n> \`I don't have the permission to delete messages, cannot afford the command\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer:{
                  text: bot.user.username
                }
              }
            }) })

            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `You selected to stay in the game **${gameCode}**\nKeep the fun going!`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
        }
    })
  }
}