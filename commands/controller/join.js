const {MessageEmbed} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
module.exports={
  name: "join",
  category: "controller",
  description: "Want to play with others or friends? Join their game",
  aliases: [],
  isBeta: false,
  run: async(bot, message, args) =>{
    const cross = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("cross"))
    const check = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("check"))

    const acceptRequest = new MessageButton()
    .setStyle("blurple")
    .setLabel("Accept it!")
    .setID("accept-player-button")

    const declineRequest = new MessageButton()
    .setStyle("red")
    .setLabel("Decline it!")
    .setID("decline-player-button")

    const requestActions = new MessageActionRow()
    .addComponent(acceptRequest)
    .addComponent(declineRequest)

    // const buttons = [acceptRequest, declineRequest]
    
    let gameCode = args[0]
    let able = true

    if(!gameCode) return message.channel.send(`> **Arguments**`, {
      embed:{
        description: `${bot.db.messages.args}\n> \`${bot.config.prefix}join <code>\``,
        color: bot.config.embed_color,
        timestamp: Date.now(),
        footer: { text: `${bot.user.username}`}
      }
    })

    const ingame_embed = new MessageEmbed()

    bot.games.forEach(game =>{
      if(game.gamePlayersJoined.includes(message.author.id)){
        ingame_embed.setDescription(`${bot.db.messages.err}\n> \`You're already in a game (${game.gameCode})\``)
        .setColor(bot.config.embed_color)
        .setTimestamp()
        .setFooter(`${bot.user.username}`)

        able = false
        return
      }
    })

    if(able === false) return message.channel.send(`> **Oops!**`, ingame_embed)

    if(!bot.games.get(gameCode)){

      return message.channel.send(`> **Oops!**`, {
        embed:{
          description: `${bot.db.messages.err}\n> \`There's no game with code ${gameCode}\``,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })
    }

    if(bot.games.get(gameCode).gamePlayersJoined.length >= bot.games.get(gameCode).gamePlayers) return message.channel.send(`> **Oops!**`, {
      embed:{
        description: `${bot.db.messages.err}\n> \`The game is currently full\``,
        color: bot.config.embed_color,
        timestamp: Date.now(),
        footer: { text: `${bot.user.username}`}
      }
    })

    if(bot.games.get(gameCode).gamePlaying) return message.channel.send(`> **Oops!**`, {
      embed:{
        description: `${bot.db.messages.err}\n> \`The game has already started\``,
        color: bot.config.embed_color,
        timestamp: Date.now(),
        footer: { text: `${bot.user.username}`}
      }
    })

    const game = await bot.games.get(gameCode)

    /*const joined_embed = new MessageEmbed()
    .setDescription(`You have joined to the game **${gameCode}**\n> Players: ${bot.games.get(gameCode).gamePlayersJoined.length}`)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    message.channel.send(`> **Done!**`, joined_embed)*/
    
    if(game.gamePrivacy === "private"){
      const member = await message.guild.members.cache.get(game.gameHost)
      if(!member) return message.channel.send(`> **Oops!**`, {
        embed:{
          description: `${bot.db.messages.err}\n> \`Game host couldn't be found\``,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })

      const msg_ = await message.channel.send(`> **Done!**`, {
        embed:{
          description: `You'll be able to join the game once the Host accept the request\n**The game is private, so it needs to be accepted**`,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })

      const msg = await member.send(`> **Request!**`, {
        embed:{
          description: `Hey there!\n**${message.author.tag}** has requested you to join the game\n\nYou can accept it by cliking the **Accept it!** button. Otherwise, you can decline it by clicking the **Decline it!** button`,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        },
        component: requestActions
      }).catch(err =>{
        return message.channel.send(`> **Oops!**`, {
          embed:{
            description: `${bot.db.messages.err}\n> \`The request couldn't be delivered : DM closed\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: `${bot.user.username}`}
          }
        })
      })

      if(!msg) return
      
      let filter = (button) => button.clicker.user.id === member.id
      const collector = msg.createButtonCollector(filter)
      collector.on("collect", async(button) =>{
        if(button.id === "accept-player-button"){
          game.gamePlayersJoined.push(message.author.id)
          msg_.edit(`> **Done!**`, {
            embed:{
              description: `Your request to join the game **${gameCode}** has been accepted\nRemember to have fun with your friends and other people!`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          await msg.delete()

          msg.channel.send(`> **Done!**`, {
            embed:{
              description: `You accepted the request of **${message.author.tag}** to join your game!\nThat's sweet, invite more players to make it more fun!`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })
        }
        if(button.id === "decline-player-button"){
          msg_.edit(`> **Oops!**`, {
            embed:{
              description: `Your request to join the game **${gameCode}** has been declined\nMaybe try to join another game`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          await msg.delete()

          msg.channel.send(`> **Done!**`, {
            embed:{
              description: `You declined the request of **${message.author.tag}** to join your game\nThat's a bit rude`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })
        }
      })

      // await msg.react(check)
      // await msg.react(cross)

      // let filter = (reaction, user) => [cross, check].includes(reaction.emoji) && (member.id === user.id)
      // let collector = await msg.createReactionCollector(filter)
      // collector.on(`collect`, async(reaction, emoji) =>{
      //   if(reaction.emoji === check){
      //     game.gamePlayersJoined.push(message.author.id)
      //     msg_.edit(`> **Done!**`, {
      //       embed:{
      //         description: `You have joined the game **${gameCode}**\nRemember to have fun with your friends and other people!`,
      //         color: bot.config.embed_color,
      //         timestamp: Date.now(),
      //         footer: { text: `${bot.user.username}`}
      //       }
      //     })
      //   }
      //   if(reaction.emoji === cross){
      //     msg_.edit(`> **Oops!**`, {
      //       embed:{
      //         description: `Your request to join the game **${gameCode}** has been declined\nMaybe try to join another game`,
      //         color: bot.config.embed_color,
      //         timestamp: Date.now(),
      //         footer: { text: `${bot.user.username}`}
      //       }
      //     })
      //   }
      // })
    }else if(game.gamePrivacy === "public"){
      game.gamePlayersJoined.push(message.author.id)
      message.channel.send(`> **Done!**`, {
        embed:{
          description: `You have joined the game **${gameCode}**\nRemember to have fun with your friends and other people!`,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })
    }
  }
}