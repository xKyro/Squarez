const {MessageEmbed} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
module.exports={
  name: "badges",
  category: "development",
  description: "Add or remove badges from users in a easier way",
  aliases: ["bd"],
  cooldown: { time: 5, type: "s" },
  isBeta: false,
  run: async(bot, message, args) =>{
    if(message.author.id !== "639931530638131214") return message.channel.send(`> **Oops!**`, {
      embed:{
        description: `${bot.db.messages.prop}`,
        color: bot.config.embed_color,
        timestamp: Date.now(),
        footer: {
            text: `${bot.user.username}`
        }
      }
    })

    const acceptButton = new MessageButton()
    .setStyle(`blurple`)
    .setLabel(`Accept`)
    .setID(`accept-button`)

    const cancellButton = new MessageButton()
    .setStyle(`red`)
    .setLabel(`Cancell`)
    .setID(`cancell-button`)

    const badgeActions = new MessageActionRow()
    .addComponents([acceptButton, cancellButton])

    let act = args[0]
    switch(act){
      case "add":
        if(!args[1] || !args[2]) return message.channel.send(`> **Arguments!**`, {
          embed:{
            description: `${bot.db.messages.args}\n> \`${bot.config.prefix}badges add <badge name> <user>\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          }
        })

        if(!bot.db.badges.data[args[1]]) return message.channel.send(`> **Oops!**`, {
          embed:{
            description: `${bot.db.messages.err}\n> \`There's no badge with name "${args[1]}"\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          }
        })

        if(!bot.users.cache.get(args[2])) return message.channel.send(`> **Oops!**`, {
          embed:{
            description: `${bot.db.messages.err}\n> \`There's no user with ID "${args[2]}"\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          }
        })

        await message.channel.send(`> **Are you sure?**`, {
          embed:{ 
            description: `Are you sure you want to **give** the badge ${bot.db.badges.data[args[1]]} to the user **${bot.users.cache.get(args[2]).tag}**`,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          },
          component: badgeActions
        }).then(msg =>{
          let filter = (button) => button.clicker.user.id === message.author.id
          const collector = msg.createButtonCollector(filter)
          collector.on("collect", async(button) =>{
            if(button.id === "accept-button"){
              const data = bot.db.data.find(user => user.userID === args[2])

              if(data.profile.badge.badges.includes(bot.db.badges.data[args[1]])) return msg.edit(`> **Oops!**`, {
                embed:{
                  description: `${bot.db.messages.err}\n> \`The user already has the badge\``,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: {
                      text: `${bot.user.username}`
                  }
                },
                component: null
              })

              if(!data) return msg.edit(`> **Oops!**`, {
                embed:{
                  description: `${bot.db.messages.err}\n> \`User with ID "${args[2]}" is not registered\``,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: {
                      text: `${bot.user.username}`
                  }
                },
                component: null
              })

              await data.profile.badge.badges.push(bot.db.badges.data[args[1]])
              msg.edit(`> **Done!**`, {
                embed:{
                  description: `You have added the badge ${bot.db.badges.data[args[1]]} to the user **${bot.users.cache.get(args[2]).tag}**\n*They will love that, maybe..*`,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: {
                      text: `${bot.user.username}`
                  }
                },
                component: null
              })

              fs.writeFile(`./base/db.json`, JSON.stringify(bot.db), (err) => {  if(err) console.log(err) })
            }
            if(button.id === "cancell-button"){
              await msg.delete()
            }
          })
        })

        break
      case "remove":
        if(!args[1] || !args[2]) return message.channel.send(`> **Arguments!**`, {
          embed:{
            description: `${bot.db.messages.args}\n> \`${bot.config.prefix}badges remove <badge name> <user>\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          }
        })

        if(!bot.db.badges.data[args[1]]) return message.channel.send(`> **Oops!**`, {
          embed:{
            description: `${bot.db.messages.err}\n> \`There's no badge with name "${args[1]}"\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          }
        })

        if(!bot.users.cache.get(args[2])) return message.channel.send(`> **Oops!**`, {
          embed:{
            description: `${bot.db.messages.err}\n> \`There's no user with ID "${args[2]}"\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          }
        })

        await message.channel.send(`> **Are you sure?**`, {
          embed:{ 
            description: `Are you sure you want to **remove** the badge ${bot.db.badges.data[args[1]]} from the user **${bot.users.cache.get(args[2]).tag}**`,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
          },
          component: badgeActions
        }).then(msg =>{
          let filter = (button) => button.clicker.user.id === message.author.id
          const collector = msg.createButtonCollector(filter)
          collector.on("collect", async(button) =>{
            if(button.id === "accept-button"){
              const data = bot.db.data.find(user => user.userID === args[2])
              if(!data.profile.badge.badges.includes(bot.db.badges.data[args[1]])) return msg.edit(`> **Oops!**`, {
                embed:{
                  description: `${bot.db.messages.err}\n> \`The user doesn't have the badge\``,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: {
                      text: `${bot.user.username}`
                  }
                },
                component: null
              })

              if(!data) return msg.edit(`> **Oops!**`, {
                embed:{
                  description: `${bot.db.messages.err}\n> \`User with ID "${args[2]}" is not registered\``,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: {
                      text: `${bot.user.username}`
                  }
                },
                component: null
              })

              let newBadges = []
              data.profile.badge.badges.forEach(badge =>{
                if(badge !== bot.db.badges.data[args[1]]) newBadges.push(badge)
              })
              data.profile.badge.badges = newBadges

              msg.edit(`> **Done!**`, {
                embed:{
                  description: `You have removed the badge ${bot.db.badges.data[args[1]]} from the user **${bot.users.cache.get(args[2]).tag}**\n*They will notice that*`,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: {
                      text: `${bot.user.username}`
                  }
                },
                component: null
              })

              fs.writeFile(`./base/db.json`, JSON.stringify(bot.db), (err) => {  if(err) console.log(err) })
            }
            if(button.id === "cancell-button"){
              await msg.delete()
            }
          })
        })
        break
    }
  }
}