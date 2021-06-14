const {MessageEmbed, MessageAttachment, Util} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
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
        collector.on("collect", async(button) =>{
            button.defer()

            if(button.id === "close-button"){
                custom.modifying = false
                msg.delete()
            }
            if(button.id === "go-back-button"){
                custom.modifying = false
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

                while(custom.modifying === true){

                    let tFilter = (m) => m.author.id === message.author.id
                    const messages = await msg.channel.createMessageCollector(tFilter, {max: 1})

                    if(custom.modifying === false) return

                    //Collector
                    let propMessages
                    let beforeMsg

                    let property = messages.first().content.trim()

                    messages.first().delete().catch(err => { if(err) console.log(err) })
                    switch(property){
                        case "team.name":
                            beforeMsg = await message.channel.send(`> **Change team Name**`, {
                                embed:{
                                    description: `Enter a new team name, the team name must be **4 - 20** characters in length`,
                                    fields:[
                                        {name: `Current Name`, value: `${team.info.teamName}`}
                                    ],
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                },
                            })

                            propMessages = await msg.channel.createMessageCollector(tFilter, {max: 1})
                            if(propMessages.first().content.trim().length < 4 || propMessages.first().content.trim().length > 20){
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your team name is not in the range 4 - 20 characters\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }else{
                                team.info.teamName = propMessages.first().content.trim()
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team name has been successfully changed to **${team.info.teamName}**`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }
                            propMessages.first().delete().catch(err => { if(err) console.log(err) })
                            break
                        case "team.desc":
                            beforeMsg = await message.channel.send(`> **Change team Description**`, {
                                embed:{
                                    description: `Enter a new team description, the team description must be **4 - 512** characters in length`,
                                    fields:[
                                        {name: `Current Description`, value: `${team.info.teamDesc ? team.info.teamDesc : `No description`}`}
                                    ],
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                },
                            })

                            propMessages = await msg.channel.createMessageCollector(tFilter, {max: 1})
                            if(propMessages.first().content.trim().length < 4 || propMessages.first().content.trim().length > 512){
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your team description is not in the range 4 - 512 characters\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }else{
                                team.info.teamDesc = propMessages.first().content.trim()
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team description has been successfully changed to **${team.info.teamDesc.slice(0, 24)}...**`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }
                            propMessages.first().delete().catch(err => { if(err) console.log(err) })
                            break
                        case "team.icon":
                            beforeMsg = await message.channel.send(`> **Change team Icon**`, {
                                embed:{
                                    description: `Enter a new team icon, the team icon must be a **valid** URL with an image`,
                                    fields:[
                                        {name: `Current Icon`, value: `Cannot show team icon`}
                                    ],
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                },
                            })

                            propMessages = await msg.channel.createMessageCollector(tFilter, {max: 1})
                            if(!regExURL.test(propMessages.first().content.trim())){
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your team icon is not a valid URL\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }else{
                                team.info.teamIcon = propMessages.first().content.trim()
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team icon has been successfully changed`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }
                            propMessages.first().delete().catch(err => { if(err) console.log(err) })
                            break
                        case "team.banner":
                            if(!svProfile){ 
                                message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`You cannot edit your team banner without the role Supporter (Squarez official server)\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }else{
                              beforeMsg = await message.channel.send(`> **Change team Banner**`, {
                                  embed:{
                                      description: `Enter a new team banner, the team banner must be a **valid** URL with an image`,
                                      fields:[
                                          {name: `Current Banner`, value: `Cannot show team banner`}
                                      ],
                                      color: bot.config.embed_color,
                                      timestamp: Date.now(),
                                      footer: { text: `${bot.user.username}`}
                                  },
                              })

                              propMessages = await msg.channel.createMessageCollector(tFilter, {max: 1})
                              if(!regExURL.test(propMessages.first().content.trim())){
                                  beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                  message.channel.send(`> **Oops!**`, {
                                      embed:{
                                          description: `${bot.db.messages.err}\n> \`Your team banner is not a valid URL\``,
                                          color: bot.config.embed_color,
                                          timestamp: Date.now(),
                                          footer: { text: `${bot.user.username}`}
                                      },
                                  }).then(msg => { msg.delete({timeout: 5000}) })
                              }else{
                                  team.info.teamBanner = propMessages.first().content.trim()
                                  beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                  message.channel.send(`> **Done!**`, {
                                      embed:{
                                          description: `Your team banner has been successfully changed`,
                                          color: bot.config.embed_color,
                                          timestamp: Date.now(),
                                          footer: { text: `${bot.user.username}`}
                                      },
                                  }).then(msg => { msg.delete({timeout: 5000}) })
                              }
                              propMessages.first().delete().catch(err => { if(err) console.log(err) })
                            }
                            break
                        case "team.requiredLvl":
                            beforeMsg = await message.channel.send(`> **Change team Required Level**`, {
                                embed:{
                                    description: `Enter a new team required level to join`,
                                    fields:[
                                        {name: `Current Required Level`, value: `${team.info.teamReqLvl ? team.info.teamReqLvl : `No level`}`}
                                    ],
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                },
                            })

                            propMessages = await msg.channel.createMessageCollector(tFilter, {max: 1})
                            if(isNaN(propMessages.first().content.trim())){
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`Your team required level is not a number\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }else{
                                team.info.teamReqLvl = propMessages.first().content.trim()
                                beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                message.channel.send(`> **Done!**`, {
                                    embed:{
                                        description: `Your team required level to join has been successfully changed to **${propMessages.first().content.trim()}**`,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }
                            propMessages.first().delete().catch(err => { if(err) console.log(err) })
                            break
                        case "team.invite":
                            if(!svProfile){
                                message.channel.send(`> **Oops!**`, {
                                    embed:{
                                        description: `${bot.db.messages.err}\n> \`You cannot edit your team invite without the role Supporter (Squarez official server)\``,
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                }).then(msg => { msg.delete({timeout: 5000}) })
                            }else{
                                beforeMsg = await message.channel.send(`> **Change team Invite**`, {
                                    embed:{
                                        description: `Enter a new team invite, the team invite must be **4 - 12** characters in length`,
                                        fields:[
                                            {name: `Current Invite`, value: `${team.team.teamCode ? team.team.teamCode : `No invite code`}`}
                                        ],
                                        color: bot.config.embed_color,
                                        timestamp: Date.now(),
                                        footer: { text: `${bot.user.username}`}
                                    },
                                })

                                propMessages = await msg.channel.createMessageCollector(tFilter, {max: 1})
                                if(propMessages.first().content.trim().length < 4 || propMessages.first().content.trim().length > 12){
                                    beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                    message.channel.send(`> **Oops!**`, {
                                        embed:{
                                            description: `${bot.db.messages.err}\n> \`Your team invite is not in the range 4 - 12 characters\``,
                                            color: bot.config.embed_color,
                                            timestamp: Date.now(),
                                            footer: { text: `${bot.user.username}`}
                                        },
                                    }).then(msg => { msg.delete({timeout: 5000}) })
                                }else{
                                    team.team.teamCode = "team/" + propMessages.first().content.trim()
                                    beforeMsg.delete().catch(err => { if(err) console.log(err) })
                                    message.channel.send(`> **Done!**`, {
                                        embed:{
                                            description: `Your team invite has been successfully changed to **${team.team.teamCode}**`,
                                            color: bot.config.embed_color,
                                            timestamp: Date.now(),
                                            footer: { text: `${bot.user.username}`}
                                        },
                                    }).then(msg => { msg.delete({timeout: 5000}) })
                                }
                                propMessages.first().delete().catch(err => { if(err) console.log(err) })
                            }
                            
                            break
                        default:
                            message.channel.send(`> **Oops!**`, {
                                embed:{
                                    description: `${bot.db.messages.err}\n> \`The property "${property}" is not defined\``,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: `${bot.user.username}`}
                                },
                            }).then(msg => { msg.delete({timeout: 5000}) })
                            break
                    }
                }
            }
            if(button.id === "save-team-button"){
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