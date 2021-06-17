const {MessageEmbed} = require("discord.js")
const fs = require("fs")
const Duration = require("humanize-duration")
module.exports={
  name: "leaderboard",
  category: "utility",
  description: "Feeling competitive? You can see who is the best player here!",
  aliases: ["ranking", "leaders", "top"],
  cooldown: { time: 5, type: "s" },
  isBeta: false,
  run: async(bot, message, args) =>{

    let type = args[0]
    if(!type) type = "nc"

    if(type !== "nc" && type !== "c") return message.channel.send(`> **Oops!**`, {
        embed:{
            description: `${bot.db.messages.err}\n> \`The scoreboard type "${type}" is not valid\`\n> \`Use: "nc" (No Competitive) or "c" (Competitive)\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
        }
    })
    
    let data = await bot.db.data
    if(!data) return message.channel.send(`> **Oops!**`, {
        embed:{
            description: `${bot.db.messages.err}\n> \`Failed to load data\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
        }
    })

    if(type === "c") data = data.filter(user => !user.profile.badge.badges.includes("<:bad_10:853499394854354954>"))

    data = data.sort((a, b) => b.leveling.lvl === a.leveling.lvl ? b.leveling.xp - a.leveling.xp : b.leveling.lvl - a.leveling.lvl)
    data = data.filter(user => bot.users.cache.get(user.userID))

    message.channel.send(`> **Global leaderboard**\n> Top **10** best players of squarez`, {
        embed:{
            thumbnail: { url: bot.user.displayAvatarURL({size: 2048, dynamic:true}) },
            description: `This is the current ${type === "nc" ? `**No Competitive**` : `**Competitive**`} global leaderboard\n\n**Note:** ${bot.db.event.running ? `Competitive period is now active!\nGo ahead and be the **BEST Player** of Squarez. You'll also receive an unique and speciall badge for being in **Top 3**\n> **Competition ends In:** ${Duration(bot.db.event.deadline - Date.now(), { units:["mo", "d", "h", "m", "s"], largest: 2, round:true })}` : `Competitive period is not active yet!`}`,
            fields:[
                {name: `Best Player`, value: `The actual best player of squarez is **${bot.users.cache.get(data[0].userID) ? bot.users.cache.get(data[0].userID).tag : `Unknown user`}** with:\n> **${data[0].leveling.lvl}** levels and **${data[0].leveling.xp}** experience`},
                {name: `Top 10`, value: `${data.slice(0, 10).map((user, i) => { return `**#${i+1}.** Player: \`${bot.users.cache.get(user.userID) ? bot.users.cache.get(user.userID).tag : `Unknown user`}\` | Lvl: \`${user.leveling.lvl}\` - Exp: \`${user.leveling.xp}\`` }).join("\n")}`}
            ],
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: {
                text: `${bot.user.username}`
            }
        }
    })
  }
}