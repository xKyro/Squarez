const {MessageEmbed, MessageAttachment} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "feedback",
    category: "utility",
    description: "Send me your opinion/feedback about the bot! What would you like to be implemented? or Let me your opinion",
    aliases: ["fb"],
    cooldown: { time: 30, type: "s" },
    isBeta: false,
    run: async(bot, message, args) => {

        let myFeedback = {
            title: null,
            feedback: null,
            rating: null,
            reset: () =>{
                myFeedback.title = null
                myFeedback.feedback = null
                myFeedback.rating = null
            }
        }

        class Feedback {
            feedbackId = null
            author = { username: null, id: null }
            content = null
            constructor(feedbackAuthor, feedbackContent){
                this.feedbackId = newFeedbackId()
                this.content = feedbackContent
                this.author.username = feedbackAuthor.tag
                this.author.id = feedbackAuthor.id

                function newFeedbackId(){
                    let str = "abcdwxyz1234567890"
                    let id = ""
                    for(let i = 0; i < 12; i++){
                        if(i % 4 === 0 && i !== 0) id = id + "-"
                        id = id + str.charAt(Math.floor(Math.random() * str.length))
                    }

                    return id.length > 0 ? id : null
                }
            }
        }

        const submitButton = new MessageButton()
        .setStyle("blurple")
        .setLabel("Submit!")
        .setID("submit-feedback-button")
        
        const cancellButton = new MessageButton()
        .setStyle("red")
        .setLabel("Cancell")
        .setID("cancell-feedback-button")

        const feedbackActions = new MessageActionRow()
        .addComponent(submitButton)
        .addComponent(cancellButton)

        // const buttons = [submitButton, cancellButton]

        const pmsg = await message.channel.send(`> **Feedback**\n> Let me know your opinion about the bot! "Do you like it?", "Any idea to help me improve?", "There's something you want to be implemented?"\n> Let it in here!`, {
            embed:{
                description: `Hey, you're going to send your Feedback to the Developer`,
                fields:[
                    {name: `Limitations`, value: `Please follow all of these limitations at the time of making your feedback:\n**[>]** Your feedback title must have: 4 - 20 characters\n**[>]** Your feedback description must have: 6 - 512 characters\n**[>]** Your feedback rating must be a valid number between **1** and **10** (Do not include letters)\n**[>]** Any field of your feedback cannot include any emotes (Unless they're in unicode)`},
                    {name: `Usage`, value: `If you want to modify the title reply with "title -> <new title>"\nIf you want to modify the feedback reply with "feedback -> <new feedback>"\nOr, if you want to modify the rating reply with "rating -> <new rating>"\n\nIf you want to RESET ALL of the fields, reply with "reset"\nYou can cancell it by clicking **Cancell**. Otherwise, you can submit it by clicking **Submit!**`}
                ],
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: bot.user.username }
            }
        })

        const msg = await message.channel.send({
            embed:{
                author:{
                    name: `Feedback Preview`
                },
                description: `\`\`\`${myFeedback.title ? myFeedback.title.toUpperCase() : `FEEDBACK TITLE HERE!`}\n\n${myFeedback.feedback ? myFeedback.feedback : `Your opinions and comments goes here!`}\n\n${myFeedback.rating ? myFeedback.rating : `Your rating of the bot and services goes here!`}\`\`\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: bot.user.username }
            },
            component: feedbackActions
        })

        let filter = m => m.author.id === message.author.id
        let messages = null
        let msg_ = null
        let res = ""
        let prop = ""
        let status = "progress"

        let filterButton = (button) => button.clicker.user.id === message.author.id
        const collector = msg.createButtonCollector(filterButton)

        collector.on("collect", async(button) =>{

            button.defer()

            if(button.id === "submit-feedback-button"){
                status = "submitted"
                pmsg.delete()
                msg.delete()

                const psend = await message.channel.send(`> **Sending Feedback..**`,{
                    embed:{
                        description: `Your feedback is now being sent to my **Feedback Log**\n*Please be a little patient while this action is running*`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: bot.user.username }
                    }
                })
    
                setTimeout(async function(){
                    const submission = bot.guilds.cache.get("838086291458621460").channels.cache.find(ch => ch.name.includes("feedback-log"))
                    if(!submission) return psend.edit(`> **Oops!**`,{
                        embed:{
                            description: `${bot.db.messages.err}\n> \`Your feedback couldn't be sent (My feedback log failed to load)\``,
                            color: bot.config.embed_color,
                            timestamp: Date.now(),
                            footer: { text: bot.user.username }
                        }
                    })
    
                    psend.edit(`> **Done!**`,{
                        embed:{
                            description: `Your feedback has been sent to my **Feedback Log**\nThank you so much, I really appreciate that!`,
                            color: bot.config.embed_color,
                            timestamp: Date.now(),
                            footer: { text: bot.user.username }
                        }
                    })

                    const feedbacks = bot.db.feedbacks.data
                    if(!feedbacks) return psend.edit(`> **Oops!**`, {
                        embed:{
                            description: `${bot.db.messages.err}\n> \`Your feedback couldn't be sent (Feedback register failed to load)\``,
                            color: bot.config.embed_color,
                            timestamp: Date.now(),
                            footer: { text: bot.user.username }
                        }
                    })

                    const feed = new Feedback(message.author, myFeedback)
                    await feedbacks.push(feed)
    
                    submission.send(`> **New Feedback**\n> **ID:** ${feed.feedbackId}`, {
                        embed:{
                            description: `Hey!\nHere's a new feedback from **${feed.author.username}** (${feed.author.id}), the feedback has been sent from **${message.guild.name}**`,
                            fields:[
                                {name: `Feedback`, value: `\`\`\`\n${myFeedback.title ? myFeedback.title.toUpperCase() : `FEEDBACK TITLE HERE!`}\n\n${myFeedback.feedback ? myFeedback.feedback : `Your opinions and comments goes here!`}\n\n${myFeedback.rating ? myFeedback.rating : `Your rating of the bot and services goes here!`}\`\`\``}
                            ],
                            color: bot.config.embed_color,
                            timestamp: Date.now(),
                            footer: { text: bot.user.username }
                        }
                    })

                    fs.writeFile(`./base/db.json`, JSON.stringify(bot.db), (err) => {  if(err) console.log(err) })
                }, 5000)  
            }
            if(button.id === "cancell-feedback-button"){
                status = "cancelled"
                pmsg.delete()
                msg.delete()

                message.channel.send(`> **Done!**`, {
                    embed:{
                        description: `You have cancelled your feedback\nYou can still re-send a feedback later`,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: bot.user.username }
                    }
                }).then(m => { m.delete({timeout: 5000}) })
            }
        })

        while(status !== "submitted" && status !== "cancelled"){
            messages = await message.channel.awaitMessages(filter, {max: 1})
            msg_ = await messages.first()
            res = messages.first().content.split("->")[1] ? messages.first().content.split("->")[1].trim() : null
            prop = messages.first().content.split("->")[0] ? messages.first().content.split("->")[0].trim() : null

            if(status === "submitted" || status === "cancelled") return

            let responses = ["title", "feedback", "rating", "reset", "cancell", "submit"]
            if(!responses.includes(prop)){
                msg_.delete().catch(err => { if(err) console.log(err) })
                message.channel.send(`> **Oops**`, {
                    embed:{
                        description: `${bot.db.messages.err}\n> \`The property "${prop}" is not valid or is unknown\``,
                        color: bot.config.embed_color,
                        timestamp: Date.now(),
                        footer: { text: bot.user.username }
                    }
                }).then(m => { m.delete({timeout: 5000}) })
            }else{
                switch(prop){
                    case "reset":
                        myFeedback.reset()
                        msg_.delete().catch(err => { if(err) console.log(err) })
                        message.channel.send(`> **Done!**`, {
                            embed:{
                                description: `Your feedback information has been cleared to **Default**!`,
                                color: bot.config.embed_color,
                                timestamp: Date.now(),
                                footer: { text: bot.user.username }
                            }
                        }).then(m => { m.delete({timeout: 5000}) })

                        msg.edit({
                            embed:{
                                author:{
                                    name: `Feedback Preview`
                                },
                                description: `\`\`\`${myFeedback.title ? myFeedback.title.toUpperCase() : `FEEDBACK TITLE HERE!`}\n\n${myFeedback.feedback ? myFeedback.feedback : `Your opinions and comments goes here!`}\n\n${myFeedback.rating ? myFeedback.rating : `Your rating of the bot and services goes here!`}\`\`\``,
                                color: bot.config.embed_color,
                                timestamp: Date.now(),
                                footer: { text: bot.user.username }
                            },
                            component: feedbackActions
                        })
                        break;
                    case "title":
                        if(res.length >= 4 && res.length <= 20){
                            myFeedback.title = res
                            msg_.delete().catch(err => { if(err) console.log(err) })
                            message.channel.send(`> **Done!**`, {
                                embed:{
                                    description: `Your feedback title was successfully updated!`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                }
                            }).then(m => { m.delete({timeout: 5000}) })

                            msg.edit({
                                embed:{
                                    author:{
                                        name: `Feedback Preview`
                                    },
                                    description: `\`\`\`\n${myFeedback.title ? myFeedback.title.toUpperCase() : `FEEDBACK TITLE HERE!`}\n\n${myFeedback.feedback ? myFeedback.feedback : `Your opinions and comments goes here!`}\n\n${myFeedback.rating ? myFeedback.rating : `Your rating of the bot and services goes here!`}\`\`\``,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                },
                                component: feedbackActions
                            })
                        }else{
                            msg_.delete().catch(err => { if(err) console.log(err) })
                            message.channel.send(`> **Oops**`, {
                                embed:{
                                    description: `${bot.db.messages.err}\n> \`Your feedback title is less than 4 or greater than 20 characters\``,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                }
                            }).then(m => { m.delete({timeout: 5000}) })
                        }
                        break;
                    case "feedback":
                        if(res.length >= 6 && res.length <= 512){
                            myFeedback.feedback = res
                            msg_.delete().catch(err => { if(err) console.log(err) })
                            message.channel.send(`> **Done!**`, {
                                embed:{
                                    description: `Your feedback description was successfully updated!`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                }
                            }).then(m => { m.delete({timeout: 5000}) })

                            msg.edit({
                                embed:{
                                    author:{
                                        name: `Feedback Preview`
                                    },
                                    description: `\`\`\`\n${myFeedback.title ? myFeedback.title.toUpperCase() : `FEEDBACK TITLE HERE!`}\n\n${myFeedback.feedback ? myFeedback.feedback : `Your opinions and comments goes here!`}\n\n${myFeedback.rating ? myFeedback.rating : `Your rating of the bot and services goes here!`}\`\`\``,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                },
                                component: feedbackActions
                            })
                        }else{
                            msg_.delete().catch(err => { if(err) console.log(err) })
                            message.channel.send(`> **Oops**`, {
                                embed:{
                                    description: `${bot.db.messages.err}\n> \`Your feedback description is less than 6 or greater than 512 characters\``,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                }
                            }).then(m => { m.delete({timeout: 5000}) })
                        }
                        break;
                    case "rating":
                        if(parseInt(res) >= 1 && parseInt(res) <= 10 && !isNaN(res)){
                            myFeedback.rating = res + "★"
                            msg_.delete().catch(err => { if(err) console.log(err) })
                            message.channel.send(`> **Done!**`, {
                                embed:{
                                    description: `Your feedback rating was successfully updated!`,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                }
                            }).then(m => { m.delete({timeout: 5000}) })

                            msg.edit({
                                embed:{
                                    author:{
                                        name: `Feedback Preview`
                                    },
                                    description: `\`\`\`\n${myFeedback.title ? myFeedback.title.toUpperCase() : `FEEDBACK TITLE HERE!`}\n\n${myFeedback.feedback ? myFeedback.feedback : `Your opinions and comments goes here!`}\n\n${myFeedback.rating ? myFeedback.rating : `Your rating of the bot and services goes here!`}\`\`\``,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                },
                                component: feedbackActions
                            })
                        }else{
                            msg_.delete().catch(err => { if(err) console.log(err) })
                            message.channel.send(`> **Oops**`, {
                                embed:{
                                    description: `${bot.db.messages.err}\n> \`Your feedback rating is not a valid number or your feedback rating is less than 1 or greater than 10\``,
                                    color: bot.config.embed_color,
                                    timestamp: Date.now(),
                                    footer: { text: bot.user.username }
                                }
                            }).then(m => { m.delete({timeout: 5000}) })
                        }
                        break;
                }
            }
        }
    }
}