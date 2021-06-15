const {MessageEmbed, MessageAttachment, Util} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
const { URLSearchParams } = require("url")
module.exports={
    name: "customteam",
    category: "teams",
    description: "Want to customize your team and make it look better? Well you can do it right here",
    aliases: ["cteam", "ct"],
    cooldown: { time: 45, type: "s" },
    isBeta: true,
    run: async(bot, message, args) => {
      
        if(message.guild.id !== "836264176149725226") return message.channel.send(`> **Maintenance**`, {
          embed:{
                description: `${bot.db.messages.maint}`,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        const modifyButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Modify")
        .setID("modify-team-button")

        const saveButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Save & Exit")
        .setID("save-team-button")

        const resetButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Reset")
        .setID("reset-team-button")

        const goBackButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Go back")
        .setID("go-back-button")

        const closeButton = new MessageButton()
        .setStyle("red")
        .setLabel("Close")
        .setID("close-button")

        const customActions = new MessageActionRow()
        .addComponents([modifyButton, saveButton, resetButton, closeButton])

        const team = bot.db.teams.find(team => team.team.teamOwner === message.author.id)
        const svProfile = bot.guilds.cache.get("838086291458621460").members.cache.get(message.author.id) ? bot.guilds.cache.get("838086291458621460").members.cache.get(message.author.id).roles.cache.get("852972522823221298") : null

        if(!team) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You don't own a team yet\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        const baseTeam = {team: {teamCode: team.team.teamCode}, ...team.info}

        let base = {
            embed:{
                description: `Hello there **${message.author.username}**\nLooking for customize your team? Well you're in the right place!\n\nRead all the information below to get started!`,
                fields:[
                    {name: `Help`, value: `Below this message are 3 buttons\n\nThe button with name **Modify** will help you to start modifying properties as you like, some properties are only available for users that **supported** the bot (Those properties will be indicated as [P])\n\nThe button with name **Save & Exit** will save your modifications of your team and close this message to finally apply the changes\n\nThe button with name **Reset** will reset all of the modified properties`}
                ],
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            },
            component: customActions
        }

        const custom = {
            modifying: false
        }

        let regExURL = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

        const msg = await message.channel.send(`> **Customize Team**\n> Team: **${team.info.teamName}**`, base)
        let filter = (button) => button.clicker.user.id === message.author.id
        const collector = await msg.createButtonCollector(filter)
        let msgCollector = null
        collector.on("collect", async(button) =>{
            button.defer()

            if(button.id === "close-button"){
                custom.modifying = false
                await msgCollector.stop()
                msg.delete()
            }
            if(button.id === "go-back-button"){
                custom.modifying = false
                await msgCollector.stop()
                msg.edit(`> **Customize Team**\n> Team: **${team.info.teamName}**`, base)
            }
            if(button.id === "modify-team-button"){
                custom.modifying = true
                msg.edit(`> **Customize Team**\n> Team: **${team.info.teamName}**`, {
                    embed:{
                        description: `You're now in the page for the modification of the properties of your team`,
                        fields:[
                            {name: `Team Properties`, value: `There are **6** properties that can be modified:\n\n> \`team.name\`: Change the name of your team\n> \`team.desc\`: Change the description of your team\n> \`team.icon\`: Change the icon of your team\n> \`team.banner\`: Change the banner of your team [P]\n> \`team.requiredLevel\`: Change the required level to join your team\n> \`team.invite\`: Change the invite of your team [P]`},
                            {name: `Limits`, value: `Every property has a limit that cannot be exceeded\n\n> The name of the team must be **4 - 20** characters in length\n> The description of the team must be **4 - 512** characters in length\n> The team icon must be a **valid** URL that contains an image\n> The team banner must be a **valid** URL that contains an image\n> The required level has no limit, unless the required level is too high for users\n> The team invite must be **4 - 12** characters in length`},
                            {name: `Modify`, value: `To access to one of the properties above, reply the name of the property and then you'll allowed to modify it`}
                        ],
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: `${bot.user.username}`}
                    },
                    component: goBackButton
                })
                

                let tFilter = (m) => m.author.id === message.author.id
                msgCollector = await msg.channel.createMessageCollector(tFilter)

                let inteMsg

                //Collector
                msgCollector.on("collect", async(message) =>{
                    if(!custom.modifying){
                        msgCollector.stop()
                        return
                    }
                    await message.delete().catch(err => { if(err) console.log(err) })
                    switch(message.content){
                        case "team.name":
                            inteMsg = await message.channel.send(`> **Customize Team**\n> Team: **${team.info.teamName}**`, {
                                embed:{
                                    description: `**Edit team name**\n__Provide the new name for your team__\n\n**Limitation**\n> The name of the team must be **4 - 20** characters in length`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                }
                            })
                            await inteMsg.channel.awaitMessages(tFilter, {max: 1}).then(async coll =>{
                                await inteMsg.delete()
                                if(coll.first().content.length < 4 || coll.first().content.length > 20) return message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your provided team name is not in the range 4 - 20 characters\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })

                                team.info.teamName = coll.first().content.trim()
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team name has been updated to **${team.info.teamName}**\n*Remember to save this modification when you're done*`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })
                            })
                            break
                        case "team.desc":
                            inteMsg = await message.channel.send(`> **Customize Team**\n> Team: **${team.info.teamName}**`, {
                                embed:{
                                    description: `**Edit team description**\n__Provide the new description for your team__\n\n**Limitation**\n> The description of the team must be **4 - 512** characters in length`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                }
                            })
                            await inteMsg.channel.awaitMessages(tFilter, {max: 1}).then(async coll =>{
                                await inteMsg.delete()
                                if(coll.first().content.length < 4 || coll.first().content.length > 512) return message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your provided team description is not in the range 4 - 512 characters\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })

                                team.info.teamDesc = coll.first().content.trim()
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team description has been updated to **${team.info.teamDesc.slice(0, 20)}..**\n*Remember to save this modification when you're done*`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })
                            })
                            break
                        case "team.icon":
                            inteMsg = await message.channel.send(`> **Customize Team**\n> Team: **${team.info.teamName}**`, {
                                embed:{
                                    description: `**Edit team icon**\n__Provide the new icon for your team__\n\n**Limitation**\n> The team icon must be a **valid** URL that contains an image`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                }
                            })
                            await inteMsg.channel.awaitMessages(tFilter, {max: 1}).then(async coll =>{
                                await inteMsg.delete()
                                if(!regExURL.test(coll.first().content)) return message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your provided team icon is not a valid URL with an image\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })

                                team.info.teamIcon = coll.first().content.trim()
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team icon has been updated to **${team.info.teamIcon.slice(0, 20)}..**\n*Remember to save this modification when you're done*`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })
                            })
                            break
                        case "team.banner":
                            inteMsg = await message.channel.send(`> **Customize Team**\n> Team: **${team.info.teamName}**`, {
                                embed:{
                                    description: `**Edit team banner**\n__Provide the new banner for your team__\n\n**Limitation**\n> The team icon must be a **valid** URL that contains an image`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                }
                            })
                            await inteMsg.channel.awaitMessages(tFilter, {max: 1}).then(async coll =>{
                                await inteMsg.delete()
                                if(!regExURL.test(coll.first().content)) return message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your provided team banner is not a valid URL with an image\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })

                                team.info.teamBanner = coll.first().content.trim()
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team banner has been updated to **${team.info.teamBanner.slice(0, 20)}..**\n*Remember to save this modification when you're done*`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })
                            })
                            break
                        case "team.requiredLevel":
                            inteMsg = await message.channel.send(`> **Customize Team**\n> Team: **${team.info.teamName}**`, {
                                embed:{
                                    description: `**Edit team required level**\n__Provide the required level for your team__\n\n**Limitation**\n> The required level has no limit, unless the required level is too high for users`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                }
                            })
                            await inteMsg.channel.awaitMessages(tFilter, {max: 1}).then(async coll =>{
                                await inteMsg.delete()
                                if(isNaN(coll.first().content)) return message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your provided team required level is not a valid number\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })

                                team.info.teamReqLvl = parseInt(coll.first().content.trim())
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team required level has been updated to **${team.info.teamReqLvl}**\n*Remember to save this modification when you're done*`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })
                            })
                            break
                        case "team.invite":
                            inteMsg = await message.channel.send(`> **Customize Team**\n> Team: **${team.info.teamName}**`, {
                                embed:{
                                    description: `**Edit team invite**\n__Provide the new invite for your team__\n\n**Limitation**\n> The team invite must be **4 - 12** characters in length`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                }
                            })
                            await inteMsg.channel.awaitMessages(tFilter, {max: 1}).then(async coll =>{
                                await inteMsg.delete()
                                if(coll.first().content.length < 4 || coll.first().content.length > 12) return message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your provided team description is not in the range 4 - 12 characters\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })

                                team.team.teamCode = "team/" + coll.first().content.trim()
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team invite has been updated to **${team.team.teamCode}**\n*Remember to save this modification when you're done*`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    }
                                }).then(m => { m.delete({timeout:5000}) })
                            })
                            break
                    }
                })
            }
            if(button.id === "save-team-button"){
                await msgCollector.stop()
                msg.edit(`> **Customize Team**\n> Team: **${team.info.teamName}**\n> Saving..`, {
                    embed:{
                        description: `All of your modification is being saved into your **Team Data**`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: `${bot.user.username}`}
                    },
                    component: null
                })
                setTimeout(async() =>{
                    await fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
                    msg.edit(`> **Customize Team**\n> Team: **${team.info.teamName}**\n> Saved!`, base)
                }, 5000)
            }
            if(button.id === "reset-team-button"){
                await msgCollector.stop()
                msg.edit(`> **Customize Team**\n> Team: **${team.info.teamName}**\n> Resetting..`, {
                    embed:{
                        description: `All of your modification is being restored from your default **Team Data**`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: `${bot.user.username}`}
                    },
                    component: null
                })
                setTimeout(() =>{
                    team.info.teamName = baseTeam.teamName
                    team.info.teamDesc = baseTeam.teamDesc
                    team.info.teamIcon = baseTeam.teamIcon
                    team.info.teamBanner = baseTeam.teamBanner
                    team.info.teamReqLvl = baseTeam.teamReqLvl
                    team.team.teamCode = baseTeam.team.teamCode

                    msg.edit(`> **Customize Team**\n> Team: **${team.info.teamName}**\n> Restored!`, base)
                }, 5000)
            }
        })
    }
}