const {MessageEmbed, MessageAttachment, Util, Message} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "jointeam",
    category: "teams",
    description: "Join to a new team that you were invited",
    aliases: ["jteam", "jt"],
    isBeta: true,
    run: async(bot, message, args) => {

        const joinButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Yes! Join")
        .setID("join-team-button")

        const regretButton = new MessageButton()
        .setStyle("red")
        .setLabel("Hm, no")
        .setID("regret-join-team-button")

        const joinActions = new MessageActionRow()
        .addComponent(joinButton)
        .addComponent(regretButton)
        
        const data = bot.db.data.find(user => user.userID === message.author.id)
        if(!data) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`I couldn't get your profile information. Try again later\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        if(bot.db.teams.find(team => team.team.teamMembers.find(member => member.userID === data.userID))) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You are already on a team\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        let teamCode = args[0]

        if(!teamCode) return message.channel.send(`> **Arguments**`, {
            embed:{
                description: `${bot.db.messages.args}\n> \`${bot.config.prefix}jointeam <team code>\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        const team = bot.db.teams.find(team => team.team.teamCode === teamCode)
        if(!team) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`There's no team with invite "${teamCode}"\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        const msg = await message.channel.send(`> **Join to ${team.info.teamName}?**`, {
            embed:{
                thumbnail: { url: team.info.teamIcon },
                description: `Do you want to join to the team **${team.info.teamName}?**\nThe team has **${team.team.teamMembers.length}** members on it, the team will have **${team.team.teamMembers.length+1}** members`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            },
            component: joinActions
        })
        
        let filter = (button) => button.clicker.user.id === message.author.id
        const collector = await msg.createButtonCollector(filter)
        collector.on("collect", async(button) =>{
            button.defer()

            if(button.id === "join-team-button"){
                msg.edit(`> **Done!**`, {
                    embed:{
                        thumbnail: { url: team.info.teamIcon },
                        description: `You are now on the team **${team.info.teamName}**!\nLet's have some fun with your new teammates`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: `${bot.user.username}`}
                    },
                    component: null
                })
                team.team.teamMembers.push({
                    userID: message.author.id,
                    contribution: {
                        games: 0,
                        vict: 0
                    }
                })
                fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
            }
            if(button.id === "regret-join-team-button"){
                msg.edit(`> **Done!**`, {
                    embed:{
                        thumbnail: { url: team.info.teamIcon },
                        description: `You will no longer join to the team **${team.info.teamName}**\nYou can still join at any time`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: `${bot.user.username}`}
                    },
                    component: null
                })
            }
        })
    }
}