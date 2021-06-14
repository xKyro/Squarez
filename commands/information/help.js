const {MessageEmbed} = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const fs = require("fs")
module.exports={
  name: "help",
  category: "information",
  description: "The main help center",
  aliases: ["help-me"],
  cooldown: { time: 5, type: "s" },
  isBeta: false,
  run: async(bot, message, args) =>{

    let index = 0

    // const left = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("left"))
    // const right = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("right"))
    // const cross = bot.guilds.cache.get("836264176149725226").emojis.cache.find(em => em.name.includes("cross"))
    
    let embed_data = []
    bot.commands.forEach(cmd =>{
      if(!embed_data.find(c => c.category === cmd.category)) embed_data.push({
        category: cmd.category,
        commands: []
      })

      embed_data.find(c => c.category === cmd.category).commands.push(cmd.name)
    })

    const embeds = makeEmbeds(embed_data, bot)
    if(!embeds || embeds.length <= 0) return message.channel.send(`> **Oops!**`, {
      embed:{
        description: `${bot.db.messages.err}\n> \`Embed pages failed to load\``,
        color: bot.config.embed_color,
        timestamp: Date.now(),
        footer:{
          text: bot.user.username
        }
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

    const pageActions = new MessageActionRow()
    .addComponent(leftButton)
    .addComponent(closeButton)
    .addComponent(rightButton)

    // const buttons = [leftButton, closeButton, rightButton]

    const msg = await message.channel.send(`> **Help center**\n> If you're lost, check out these useful information`, { embed: embeds[0], component: pageActions })
    if(embeds.length < 2) return

    let filter = (button) => button.clicker.user.id === message.author.id
    const collector = msg.createButtonCollector(filter)
    collector.on("collect", async(button) =>{

      button.defer()

      if(button.id === "nav-previous-page-button"){
        if(index > 0) index--
        msg.edit({ embed: embeds[index], component: pageActions })
      }
      if(button.id === "nav-next-page-button"){
        if(index < embeds.length-1) index++
        msg.edit({ embed: embeds[index], component: pageActions })
      }
      if(button.id === "nav-close-page-button"){
        msg.delete().catch(err => { if(err) console.log(err) })
      }
    })
  }
}
function makeEmbeds(commands, bot){
  const embeds = []

  const embed_general = new MessageEmbed()
  .setAuthor(`General | ${bot.commands.size} commands | ${bot.categories.length} categories`)
  .setThumbnail(bot.user.displayAvatarURL({size: 2048, dynamic:true}))
  .addFields(
    {name: `Hello there!`, value: `Hey!\nThanks for inviting me into this great server, I got some commands below here what you may interest\n\n> You can change the page using the arrows below of this message or delete it pressing the red button`},
    {name: `What is Squarez?`, value: `Squarez is a small and simple minigame created by **${bot.users.cache.get("639931530638131214").tag}**\n> Basically, the game is.. Move your player around and get grids of your color\n> There are some power ups that can help you getting grids. But more important, if you run out of grids, you'll be eliminated\n> So, keep that in mind`},
    {name: `Commands and Categories`, value: `Actually there are **${bot.commands.size} commands** and **${bot.categories.length} categories** working 24/7 (not at all..)`}
  )
  .setColor(bot.config.embed_color)
  .setTimestamp(Date.now())
  .setFooter(bot.user.username)

  embeds.push(embed_general)

  for(let i = 0; i < commands.length; i++){
    let visual = []
    for(let x = 0; x < commands[i].commands.length; x++){
      let s = "                   "
      let n = commands[i].commands[x]

      s = s.slice(n.length+bot.config.prefix.length)
      s = `${bot.config.prefix+n + s}`
      visual.push(s)
    }

    let cat = commands[i].category
    cat = cat[0].toUpperCase() + cat.slice(1)

    const embed = new MessageEmbed()
    .setAuthor(`${cat} | ${commands[i].commands.length} commands`)
    .setThumbnail(bot.user.displayAvatarURL({size: 2048, dynamic:true}))
    .addFields(
      {name: `Commands`, value: `\`\`\`${commands[i].commands.map(cmd => { return `[>] ${cmd}:\n${bot.commands.get(cmd).aliases.length > 0 ? bot.commands.get(cmd).aliases.map(ali => { return `  [+] ${ali}` }).join("\n") : `  [x] No aliases`}\n  [!] ${bot.commands.get(cmd).description}${bot.commands.get(cmd).isBeta === true ? `\n  [B] Beta feature\n` : `\n`}` }).join("\n")}\`\`\``}
    )
    .setColor(bot.config.embed_color)
    .setTimestamp(Date.now())
    .setFooter(bot.user.username)

    embeds.push(embed)
  }

  return embeds
}