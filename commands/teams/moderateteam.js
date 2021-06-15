const {MessageEmbed, MessageAttachment, Util, Message} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "moderateteam",
    category: "teams",
    description: "Moderate your team, kick or ban members of your team if necessary",
    aliases: ["mteam", "mt"],
    cooldown: { time: 20, type: "s" },
    isBeta: true,
    run: async(bot, message, args) => {

      const team = bot.db.teams.find(team => team.team.teamOwner === message.author.id)

      if(!team) return message.channel.send(`> **Oops!**`, {
        embed:{
          description: `${bot.db.messages.err}\n> \`You don't own a team yet\``,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })

      const kickButton = new MessageButton()
      .setStyle("blurple")
      .setLabel("Kick")
      .setID("kick-member-button")

      const banButton = new MessageButton()
      .setStyle("blurple")
      .setLabel("Ban")
      .setID("ban-member-button")

      const unbanButton = new MessageButton()
      .setStyle("blurple")
      .setLabel("Unban")
      .setID("unban-member-button")

      const cancellButton = new MessageButton()
      .setStyle("red")
      .setLabel("Cancell")
      .setID("cancell-button")

      const kickActions = new MessageActionRow().addComponents([kickButton, cancellButton])
      const banActions = new MessageActionRow().addComponents([banButton, cancellButton])
      const unbanActions = new MessageActionRow().addComponents([unbanButton, cancellButton])

      let mod = args[0]
      switch(mod){
        case "kick":
          if(!args[1]) return message.channel.send(`> **Arguments**`, {
            embed:{
              description: `${bot.db.messages.args}\n> \`${bot.config.prefix}moderateteam kick <member>\``,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          if(!team.team.teamMembers.find(member => member.userID === args[1])) return message.channel.send(`> **Oops!**`, {
            embed:{
              description: `${bot.db.messages.err}\n> \`There's no member with ID "${args[1]}" in your team\``,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          message.channel.send(`> **Are you sure?**`, {
            embed:{
              description: `Are you sure that you want to **kick** the member **${bot.users.cache.get(args[1]).tag}** from your team?\n*When you kick the member they will be able to join back*`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            },
            component: kickActions
          }).then(async msg => {
            let filter = (button) => button.clicker.user.id === message.author.id
            const collector = await msg.createButtonCollector(filter)
            collector.on("collect", async(button) =>{
              if(button.id === "kick-member-button"){
                let newMembers = []
                team.team.teamMembers.forEach(member =>{
                    if(member.userID !== args[1]) newMembers.push(member)
                })

                team.team.teamMembers = newMembers
                fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })

                msg.edit(`> **Done!**`, {
                  embed:{
                    description: `The member **${bot.users.cache.get(args[1]).tag}** has been kicked from your team\n*They will be able to join back at any time*`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                  },
                  component: null
                })
              }
              if(button.id === "cancell-button"){
                msg.delete()
              }
            })
          })
          break;
        case "ban":
          if(!args[1]) return message.channel.send(`> **Arguments**`, {
            embed:{
              description: `${bot.db.messages.args}\n> \`${bot.config.prefix}moderateteam ban <member>\``,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          if(!team.team.teamMembers.find(member => member.userID === args[1])) return message.channel.send(`> **Oops!**`, {
            embed:{
              description: `${bot.db.messages.err}\n> \`There's no member with ID "${args[1]}" in your team\``,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          message.channel.send(`> **Are you sure?**`, {
            embed:{
              description: `Are you sure that you want to **ban** the member **${bot.users.cache.get(args[1]).tag}** from your team?\n*When you ban the member they won't be able to join back*`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            },
            component: banActions
          }).then(async msg => {
            let filter = (button) => button.clicker.user.id === message.author.id
            const collector = await msg.createButtonCollector(filter)
            collector.on("collect", async(button) =>{
              if(button.id === "ban-member-button"){
                let newMembers = []
                team.team.teamMembers.forEach(member =>{
                    if(member.userID !== args[1]) newMembers.push(member)
                })

                team.team.teamMembers = newMembers
                team.team.teamBans.push(args[1])
                fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })

                msg.edit(`> **Done!**`, {
                  embed:{
                    description: `The member **${bot.users.cache.get(args[1]).tag}** has been banned from your team\n*They won't be able to join back, unless they got unbanned*`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                  },
                  component: null
                })
              }
              if(button.id === "cancell-button"){
                msg.delete()
              }
            })
          })
          break;
        case "unban":
          if(!args[1]) return message.channel.send(`> **Arguments**`, {
            embed:{
              description: `${bot.db.messages.args}\n> \`${bot.config.prefix}moderateteam unban <member>\``,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          if(!team.team.teamBans.includes(args[1])) return message.channel.send(`> **Oops!**`, {
            embed:{
              description: `${bot.db.messages.err}\n> \`There's no banned member with ID "${args[1]}" in your team\``,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })

          message.channel.send(`> **Are you sure?**`, {
            embed:{
              description: `Are you sure that you want to **unban** the member **${bot.users.cache.get(args[1]).tag}** from your team?\n*When you unban the member they will be able to join back*`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            },
            component: unbanActions
          }).then(async msg => {
            let filter = (button) => button.clicker.user.id === message.author.id
            const collector = await msg.createButtonCollector(filter)
            collector.on("collect", async(button) =>{
              if(button.id === "unban-member-button"){
                let newBans = []
                team.team.teamBans.forEach(member =>{
                    if(member !== args[1]) newBans.push(member)
                })

                team.team.teamBans = newBans
                fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })

                msg.edit(`> **Done!**`, {
                  embed:{
                    description: `The member **${bot.users.cache.get(args[1]).tag}** has been unbanned from your team\n*They will be able to join back*`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                  },
                  component: null
                })
              }
              if(button.id === "cancell-button"){
                msg.delete()
              }
            })
          })
          break;
        default:
          message.channel.send(`> **Arguments**`, {
            embed:{
              description: `${bot.db.messages.args}\n> \`${bot.config.prefix}moderateteam [kick | ban | unban] <member>\``,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })
      }
    }
}