const {MessageEmbed, MessageAttachment, Util} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "newteam",
    category: "teams",
    description: "Want to make your own team of square-players? Let's go ahead",
    aliases: ["nteam", "nt"],
    isBeta: true,
    run: async(bot, message, args) => {

        class Team {
            info = {
                teamName: null,
                teamDesc: null,
                teamIcon: null,
                teamBanner: null,
                teamReqLvl: null
            }
            team = {
                teamCode: null,
                teamOwner: null,
                teamMembers: [],
                teamChallenges: []
            }
            leveling = {
                xp: 0,
                rxp: 150,
                lvl: 1
            }
            constructor(teamN, teamI){
                this.info.teamName = teamN
                this.info.teamIcon = teamI
                this.team.teamOwner = message.author.id
                this.team.teamCode = newCode()
                function newCode(){
                    let str = "abcdwxyz1234567890"
                    let id = "team/"
                    for(let i = 0; i < 12; i++){
                        if(i % 6 === 0 && i !== 0) id = id + "-"
                        id = id + str.charAt(Math.floor(Math.random() * str.length))
                    }

                    return id.length > 0 ? id : null
                }
                
                this.team.teamChallenges = newChallenges()
                function newChallenges(){
                    let challenges = []
                    let lastLvl = 2
                    for(let i = 0; i < 10; i++){
                        let diff = Math.floor(Math.random() * 4)
                        challenges.push(
                            {
                                "name": `Raise your team to the level ${diff + lastLvl}`,
                                "reward": Math.floor(Math.random() * 60) + 120,
                                "config": {"type": "raise", "apply": "team"},
                                "allMembers": false,
                                "completed": false
                            }
                        )
                        lastLvl += diff
                    }
                    return challenges
                }
            }
        }
        
        const data = bot.db.data.find(user => user.userID === message.author.id)
        if(!data) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`I couldn't get your profile information. Try again later\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        if(bot.db.teams.find(team => team.team.teamOwner === data.userID)) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You already have a team\``,
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

        if(data.leveling.lvl < 5) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You must be level 5 to create your own team\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })
        
        let teamName = args[0]
        let teamIcon = args[1]

        let regExURL = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

        if(!teamName || !teamIcon) return message.channel.send(`> **Arguments**`, {
            embed:{
                description: `${bot.db.messages.args}\n> \`${bot.config.prefix}newteam <team name> <team icon>\`\n\n> **Note:** The \`team icon\` should be an emoji, any emoji is acceptable for your team icon`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        if(teamName.length > 20 || teamName.length < 4) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`Your team name must have 4 - 20 characters\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        if(!regExURL.test(teamIcon)) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`Your team icon is not a valid URL for icon\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })
        
        if(bot.db.teams.find(team => team.info.teamName === teamName)) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`The team with the name "${teamName}" already exist\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        const team = new Team(teamName, teamIcon)
        team.team.teamMembers.push({
            userID: message.author.id,
            contribution: {
                games: 0,
                vict: 0
            }
        })

        message.channel.send(`> **Done!**`, {
            embed:{
                description: `You have created a new team!\nYour team will be known as **${team.info.teamName}**, awesome!\n\n**Now..**\nYou can get some members on your team and make your team the **Best Team** ever. Good luck\n> Invite members with the code: **${team.team.teamCode}**`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        bot.db.teams.push(team)

        fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
    }
}