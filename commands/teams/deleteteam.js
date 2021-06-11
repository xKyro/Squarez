const {MessageEmbed, MessageAttachment, Util} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "deleteteam",
    category: "teams",
    description: "If you don't want to have your team anymore, you can disband it",
    aliases: ["dteam", "dt"],
    isBeta: true,
    run: async(bot, message, args) => {
        const team = bot.db.teams.find(team => team.team.teamOwner === message.author.id)

        const regretButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Regret")
        .setID("regret-team-button")

        const disbandButton = new MessageButton()
        .setStyle("red")
        .setLabel("Disband")
        .setID("disband-team-button")

        const teamActions = new MessageActionRow()
        .addComponent(regretButton)
        .addComponent(disbandButton)

        if(!team) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You don't own a team yet\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        const msg = await message.channel.send(`> **Are you sure?**`, {
            embed:{
                thumbnail: { url: team.info.teamIcon },
                description: `Are your sure that you want to **disband** your actual team?\nEvery single member of your team will be kicked and can no longer join back to the team\nYour team code will no longer be avaible for **anyone**\n\nThink about it`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            },
            component: teamActions
        })
        
        let filter = (button) => button.clicker.user.id === message.author.id
        const collector = await msg.createButtonCollector(filter)
        collector.on("collect", async(button) =>{
            button.defer()

            if(button.id === "disband-team-button"){
                let newTeams = []
                bot.db.teams.forEach(team_ =>{
                    if(team_.team.teamCode !== team.team.teamCode) newTeams.push(team_)
                })

                bot.db.teams = newTeams
                fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })

                msg.edit(`> **Done!**`, {
                    embed:{
                        thumbnail: { url: team.info.teamIcon },
                        description: `You have **disbanded** the team **${team.info.teamName}**\nEvery member was kicked and can no longer join to the team`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: `${bot.user.username}`}
                    },
                    component: null
                })
            }
            if(button.id === "regret-team-button"){
                msg.edit(`> **Done!**`, {
                    embed:{
                        thumbnail: { url: team.info.teamIcon },
                        description: `You will no longer disband the team **${team.info.teamName}**\nI'm glad that you thought about the consequences of this action`,
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