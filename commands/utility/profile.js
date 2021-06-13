const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
  name: "profile",
  category: "utility",
  description: "See other players information using this",
  aliases: [],
  isBeta: false,
  run: async(bot, message, args) =>{
    
    const mention = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member
    if(!mention) return message.channel.send(`> **Arguments**`, {
        embed:{
            description: `${bot.db.messages.args}\n> \`${bot.config.prefix}profile <member>\``,
            timestamp: Date.now(),
            color: bot.config.embed_color,
            footer: { text: `${bot.user.username}`}
        }
    })

    if(!bot.db.data.find(user => user.userID === mention.id)) return message.channel.send(`> **Oops!**`, {
        embed:{
            description: `${bot.db.messages.err}\n> \`${mention.user.username}'s data couldn't be read\``,
            timestamp: Date.now(),
            color: bot.config.embed_color,
            footer: { text: `${bot.user.username}`}
        }
    })

    const data = await bot.db.data.find(user => user.userID === mention.id)

    message.channel.send(`> **${mention.user.username}'s profile**`, {
        embed:{
            thumbnail:{
                url: mention.user.displayAvatarURL({size: 2048, dynamic: true})
            },
            description: `This is the profile information of **${mention.user.username}**`,
            fields:[
                {name: `Connection`, value: `> First Played: **${data.connection.firstPlayed ? `${data.connection.firstPlayed}` : `Still not played the game`}**\n> Last Played: **${data.connection.firstLast ? `${data.connection.firstLast}` : `Still not played the game`}**`},
                {name: `Profile`, value: `> Badges: ${data.profile.badge.badges.length > 0 ? data.profile.badge.badges.map(bg => { return `${bg}` }).join(" ") : `**Doesn't have any badge yet**`}\n> Times Played: **${data.profile.gamesPlayed} games**\n> Victories: **${data.profile.gamesWon} games**\n> Defeats: **${data.profile.gamesLost} games**\n> Grids: **${data.profile.gridsColored} grids**\n> Powers: **${data.profile.powersTaken} powers**`},
                {name: `Leveling`, value: `> Experience: **${data.leveling.xp} / ${data.leveling.nxp}** **(${Math.floor((data.leveling.xp / data.leveling.nxp) * 100)}%)**\n> Level: **${data.leveling.lvl}**`}
            ],
            timestamp: Date.now(),
            color: bot.config.embed_color,
            footer: { text: `${bot.user.username}`}
        }
    })
  }
}