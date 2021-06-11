const {MessageEmbed, MessageAttachment, Util} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "leaveteam",
    category: "teams",
    description: "Want to make your own team or join other? Leave your actual team and search another",
    aliases: ["lteam", "lt"],
    isBeta: true,
    run: async(bot, message, args) => {
        const team = bot.db.teams.find(team => team.team.teamMembers.find(member => member.userID === message.author.id))

        const stayButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Stay")
        .setID("stay-team-button")

        const leaveButton = new MessageButton()
        .setStyle("red")
        .setLabel("Leave")
        .setID("leave-team-button")

        const teamActions = new MessageActionRow()
        .addComponent(stayButton)
        .addComponent(leaveButton)
        
        if(!team) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You are not in a team right now\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        if(team.team.teamOwner === message.author.id) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You are not allowed to leave your team, you're the owner\`\n\n> **Note:** You must **disband** your team`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })
        
        const msg = await message.channel.send(`> **Are you sure?**`, {
            embed:{
                description: `Are your sure that you want to leave your actual team?\nYou can join back at any time, until the team gets disbanded`,
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

            if(button.id === "leave-team-button"){
                let newMembers = []
                team.team.teamMembers.forEach(member =>{
                    if(member.userID !== message.author.id) newMembers.push(member)
                })

                team.team.teamMembers = newMembers
                fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })

                msg.edit(`> **Done!**`, {
                    embed:{
                        description: `You just left the team **${team.info.teamName}**\nNow you can join to any other team or join back to the same team`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: `${bot.user.username}`}
                    },
                    component: null
                })
            }
            if(button.id === "stay-team-button"){
                msg.edit(`> **Done!**`, {
                    embed:{
                        description: `You stayed on the team **${team.info.teamName}**\nKeep the fun going on your team!`,
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