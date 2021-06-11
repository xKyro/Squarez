const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
    name: "game-list",
    category: "controller",
    description: "You can see the avaible games",
    aliases: ["gamelist", "games"],
    isBeta: false,
    run: async(bot, message, args) => {

        let index = 0

        const left = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("left"))
        const right = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("right"))
        const cross = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("cross"))

        let games = getGames(bot, message.guild.id)

        const msg = await message.channel.send(`> **Searching..**`, {
            embed:{
                description: `Looking for games in the guild **${message.guild.name}**\n> This may take a few seconds`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer:{
                    text: `${bot.user.username}`
                }
            }
        })

        if(!games || games.length <= 0) return msg.edit(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`There are no games in this guild\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer:{
                    text: `${bot.user.username}`
                }
            }
        })

        const embeds = makeEmbeds(bot, games)
        if(!embeds || embeds.length <= 0) return msg.edit(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`Embed pages failed to load\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer:{
                    text: `${bot.user.username}`
                }
            }
        })

        msg.edit(`> **Game list**\n> Results: **${games.length}**`, embeds[0])
        if(embeds.length <= 1) return

        await msg.react(left)
        await msg.react(cross)
        await msg.react(right)

        let filter = (reaction, user) => [left, cross, right].includes(reaction.emoji) && (message.author.id === user.id)
        let collector = await msg.createReactionCollector(filter)
        collector.on("collect", async(reaction, user) =>{
        if(reaction.emoji === left){
            if(index > 0) index--
            msg.edit(embeds[index])
        }
        if(reaction.emoji === right){
            if(index < embeds.length-1) index++
            msg.edit(embeds[index])
        }
        if(reaction.emoji === cross){
            msg.delete()
        }
        })
    }
}
function getGames(bot, location){
    let games = []

    bot.games.forEach(game =>{
        if(game.gameLocHost === location) games.push(game)
    })

    return games
}
function makeEmbeds(bot, games){
    const embeds = []
    let k = 10
    for(let i = 0; i < games.length; i+=10){
        let info = games.filter(game => game.gamePlaying === false).slice(i, k)
        if(!info || info.length <= 0) return null
        let j = i
        k+=10
        const pag = new MessageEmbed()
        .setThumbnail(bot.user.displayAvatarURL({size: 2048, dynamic:true}))
        .setDescription(`I have found some games that you can join before they start!\nGame are showed like this one:\n> **#1.** \`host name\` | \`code\` | \`privacy\``)
        .addFields(
            {name: `Games`, value: `${info.map(game => { return `**#${++j}.** \`${bot.users.cache.get(game.gameHost).tag}\` | \`${game.gameCode}\` | \`${game.gamePrivacy}\`` }).join("\n")}`}
        )
        .setColor(bot.config.embed_color)
        .setTimestamp(Date.now())
        .setFooter(bot.user.username)

        embeds.push(pag)
    }

    return embeds
}