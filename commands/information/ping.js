const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
    name: "ping",
    category: "information",
    description: "See the latency between squarez and the Discord API",
    aliases: ["pong"],
    isBeta: false,
    run: async(bot, message, args) => {

        const msg = await message.channel.send(`> **Pinging..**`, {
            embed:{
                description: `Getting ping between **Squarez** and **Discord API**`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: {
                    text: `${bot.user.username}`
                }
            }
        }).catch(err => { console.log(err) })

        msg.edit(`> **Done!**`, {
            embed:{
                description: `Discord API: **${Math.round(bot.ws.ping)}ms**\nLatency: **${Math.floor(msg.createdTimestamp - message.createdTimestamp)}ms**`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: {
                    text: `${bot.user.username}`
                }
            }
        })
    }
}