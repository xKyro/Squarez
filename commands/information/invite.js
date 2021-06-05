const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
    name: "invite",
    category: "information",
    description: "Do you like the bot? Great! Invite him with this command (pss, also, you can give us a rating, that would help me a lot)",
    aliases: ["inv"],
    run: async(bot, message, args) => {

        message.channel.send(`> **Invite me!**`, {
            embed:{
                description: `Hello there buddy!\nDo you like the bot so much? Well, if that's why you want to invite me to one of your servers. I'm so happy!\n\nYou can see all the invite links that I have right now`,
                fields:[
                    {name: `Invite me to your Server!`, value: `Welp, click this link to invite me to your server\nI would like it\n\n**[Click here to invite Squarez to your Server](https://discord.com/oauth2/authorize?client_id=821765478618890241&scope=bot&permissions=8)**`},
                    {name: `Vote for Squarez! (Me)`, value: `If you really, but __really__, **really** like Squarez, you can help us to improve\nGiving me your upvote and feedback, will help me a ton`},
                    {name: `Join my support Server!`, value: `If you're looking for advanced support, this is our Support Server\nBut, the server is not done yet. I'll let you know when the server is done and ready`},
                    {name: `** **`, value: `**Thanks for this. I really appreciate it**`}
                ],
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer:{ text: bot.user.username }
            }
        })
    }
}