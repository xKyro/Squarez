const {MessageEmbed, MessageAttachment, Util} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
const ms = require("ms")
module.exports={
    name: "listteams",
    category: "teams",
    description: "You can see all the available teams to join them",
    aliases: ["liteam", "lit"],
    cooldown: { time: 20, type: "s" },
    isBeta: true,
    run: async(bot, message, args) => {
      let sortType = args[0]
      let index = 0
      const data = bot.db.teams
      if(!data || data.length <= 0) return message.channel.send(`> **Oops!**`, {
        embed:{
          description: `${bot.db.messages.err}\n> \`Team data failed to load\``,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })
      const embeds = generateEmbeds(data, message, bot, sortType)

      if(!embeds || embeds.length == 0) return message.channel.send(`> **Oops!**`, {
        embed:{
          description: `${bot.db.messages.err}\n> \`Embeds failed to load or there is no team data\``,
          color: bot.config.embed_color,
          timestamp: Date.now(),
          footer: { text: `${bot.user.username}`}
        }
      })

      const leftButton = new MessageButton()
      .setStyle("blurple")
      .setLabel("Previous")
      .setID("nav-previous-page-button")

      const closeButton = new MessageButton()
      .setStyle("red")
      .setLabel("Close")
      .setID("nav-close-page-button")
      
      const rightButton = new MessageButton()
      .setStyle("blurple")
      .setLabel("Next")
      .setID("nav-next-page-button")

      if(embeds.length > 1){
        leftButton.setDisabled(false)
        rightButton.setDisabled(false)
      }else{
        leftButton.setDisabled(true)
        rightButton.setDisabled(true)
      }

      const pageActions = new MessageActionRow()
      .addComponent(leftButton)
      .addComponent(closeButton)
      .addComponent(rightButton)

      const msg = await message.channel.send(`> **Teams**\n> Results: **${data.length}**`, {embed: embeds[0], component: pageActions})

      let filter = (button) => button.clicker.user.id === message.author.id
      const collector = await msg.createButtonCollector(filter)
      collector.on("collect", async(button) =>{

        button.defer()

        if(button.id === "nav-previous-page-button"){
          if(index > 0) index--
          msg.edit(`> **Teams**\n> Results: **${data.length}**`, { embed: embeds[index], component: pageActions })
        }
        if(button.id === "nav-next-page-button"){
          if(index < embeds.length-1) index++
          msg.edit(`> **Teams**\n> Results: **${data.length}**`, { embed: embeds[index], component: pageActions })
        }
        if(button.id === "nav-close-page-button"){
          msg.delete().catch(err => { if(err) console.log(err) })
        }
      })
    }
}
function generateEmbeds(data, message, bot, sort){
  const embeds = []
  let k = 10
  let j = 0
  for(let i = 0; i < data.length; i+=10){
    let simpledData = data.slice(i, k)
    if(sort){
      switch(sort){
        case "members":
          simpledData = simpledData.sort((a, b) => b.team.teamMembers.length - a.team.teamMembers.length)
          break
        case "levels":
          simpledData = simpledData.sort((a, b) => b.leveling.lvl - a.leveling.lvl)
          break
        case "badges":
          let badgesPerTeam = []
          simpledData.forEach(team =>{
            let perUser = []
            team.team.teamMembers.forEach(member =>{
              const u = bot.db.data.find(user => user.userID === member.userID)
              if(u){
                u.profile.badge.badges.forEach(badge =>{
                  if(!perUser.includes(badge)) perUser.push(badge)
                })
              }
            })
            badgesPerTeam.push({team: team.info.teamName, badges: perUser})
          })
          simpledData = simpledData.sort((a, b) => badgesPerTeam.find(t => t.team === b.info.teamName).badges.length - badgesPerTeam.find(t => t.team === a.info.teamName).badges.length)
          break
      }
    }

    let icons = {
      "members": "<:members:853718419235667968>",
      "levels": "<:level:853718925475971072>",
      "badges": "<:badges:853719136843726878>",
      "nosort": ""
    }

    const embed = new MessageEmbed()
    .setDescription(`You can search here for teams to join and bring your vibe\nTeams are not sorted until you sort them with the filters\n\nYou can sort the teams by adding to the command: \`members\`, \`levels\` or \`badges\``)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(bot.user.username)

    simpledData.map((team, g) =>{
      embed.addField(`${team.info.teamName} - ${team.team.teamCode}`, `> **${bot.users.cache.get(team.team.teamOwner).tag}**\n${team.info.teamDesc ? team.info.teamDesc : `No description about this team`}\n\n${team.info.teamReqLvl ? `\`You must be level ${team.info.teamReqLvl} to join this team\`` : `\`You don't need to have a certain level. Feel free to join\``}\n\n${icons["members"]} Members: **${team.team.teamMembers.length}**\n${icons["levels"]} Level: **${team.leveling.lvl}**\n${icons["badges"]} Badges: **${getBadgeCount(team, bot)}**`)
    })

    embeds.push(embed)
    
    k+=10
    j+=10
  }
  return embeds
}
function getBadgeCount(team, bot){
  let badgesPerTeam = []
  let perUser = []
  team.team.teamMembers.forEach(member =>{
    const u = bot.db.data.find(user => user.userID === member.userID)
    if(u){
      u.profile.badge.badges.forEach(badge =>{
        if(!perUser.includes(badge)) perUser.push(badge)
      })
    }
  })
  return perUser.length
  return
}