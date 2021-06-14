const {MessageEmbed, MessageAttachment, Util} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "infoteam",
    category: "teams",
    description: "See the progress and information about your team",
    aliases: ["iteam", "it"],
    cooldown: { time: 20, type: "s" },
    isBeta: true,
    run: async(bot, message, args) => {
        const team = bot.db.teams.find(team => team.team.teamMembers.find(member => member.userID === message.author.id))

        if(!team) return message.channel.send(`> **Oops!**`, {
            embed:{
                description: `${bot.db.messages.err}\n> \`You are not in a team right now\``,
                color: bot.config.embed_color,
                timestamp: Date.now(),
                footer: { text: `${bot.user.username}`}
            }
        })

        let teamBadges = []
        team.team.teamMembers.forEach(member =>{
            bot.db.data.find(user => user.userID === member.userID).profile.badge.badges.forEach(badge =>{
                if(!teamBadges.includes(badge)) teamBadges.push(badge)
            })
        })

        const teamEmbed = new MessageEmbed()
        .setDescription(`You're checking out the information about the team **${team.info.teamName}**`)
        .addFields(
            {name: `Team`, value: `> **Team Name:** ${team.info.teamName}\n> **Team Description:** ${team.info.teamDesc ? team.info.teamDesc : `N/A`}\n> **Team Members:** ${team.team.teamMembers.length}\n> **Team Invite:** ${team.team.teamCode}`},
            {name: `Team Details`, value: `> **Team XP:** ${team.leveling.xp} \`(${Math.floor((team.leveling.xp / team.leveling.rxp) * 100)}%)\`\n> **Team required XP:** ${team.leveling.rxp}\n> **Team Level:** ${team.leveling.lvl}\n\n> **Total team Badges:** ${teamBadges.map(bg => bg).join(" ")}`},
            {name: `Team Challenges`, value: `> **Remaining Challenges:** ${team.team.teamChallenges.filter(ch => ch.completed === false).length}\n> **Challenges Completed**: ${team.team.teamChallenges.filter(ch => ch.completed === true).length}\n\n> **Challenges:**\n\`\`\`${team.team.teamChallenges.length > 0 ? team.team.teamChallenges.map((cha, i) => { return `#${i+1}. ${cha.name}: ${cha.completed ? `Completed` : `Not completed`}` }).join("\n") : `No pending challenges for your team`}\`\`\``}
        )
        .setColor(bot.config.embed_color)
        .setTimestamp(Date.now())
        .setFooter(bot.user.username)

        if(team.info.teamIcon) teamEmbed.setThumbnail(team.info.teamIcon)
        if(team.info.teamBanner) teamEmbed.setImage(team.info.teamBanner)

        message.channel.send(`> **Team Information**\n> Team: **${team.info.teamName}**`, teamEmbed)
    }
}