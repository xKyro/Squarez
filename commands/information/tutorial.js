const {MessageEmbed} = require("discord.js")
const fs = require("fs")
module.exports={
  name: "tutorial",
  category: "information",
  description: "This is the tutorial. Come here to understand the basics of Squarez",
  aliases: ["tuto"],
  cooldown: { time: 5, type: "s" },
  isBeta: false,
  run: async(bot, message, args) =>{
    
    let grid_length = 6

    let tutorial_ended = false
    let current_objective = 0

    let objectives = []

    let randOBJ = [
      {
        objectiveREQ: `Move your player (RIGHT)`,
        end_when_player_reply: `right`
      },
      {
        objectiveREQ: `Move your player (UP)`,
        end_when_player_reply: `up`
      },
      {
        objectiveREQ: `Move your player (LEFT)`,
        end_when_player_reply: `left`
      },
      {
        objectiveREQ: `Move your player (DOWN)`,
        end_when_player_reply: `down`
      },
    ]

    for(let i = 0; i < 5; i++){
      objectives.push(randOBJ[Math.floor(Math.random() * randOBJ.length)])
    }

    let movement = [
      {
        activeWHEN: `up`,
        move: -grid_length
      },
      {
        activeWHEN: `down`,
        move: grid_length
      },
      {
        activeWHEN: `left`,
        move: -1
      },
      {
        activeWHEN: `right`,
        move: 1
      },
    ]

    let start_at = [
      {
        gridInit: Math.floor(Math.random() * grid_length * grid_length),
        gridPlayer: `<:sq_redpl:836362607786197056>`,
        gridColored: `<:sq_gridred:836361887880708148>`
      }
    ]

    let grid = []
    let indexers = ["A", "B", "C", "D", "E", "F"]
    for(let i = 0; i < 36; i++){
      start_at.some(gridSPAWN =>{
        if(gridSPAWN.gridInit === i){
          grid.push({
            gridID: indexers[Math.floor(i/grid_length)]+i,
            gridUI: gridSPAWN.gridPlayer
          })
        }else{
          grid.push({
            gridID: indexers[Math.floor(i/grid_length)]+i,
            gridUI: `<:sq_grid:836361555221676052>`
          })
        }
      })
      /*grid.push({
        gridID: indexers[Math.floor(i/grid_length)]+i,
        gridUI: `:black_large_square:`
      })*/
    }
    
    const embed = new MessageEmbed()
    .setDescription(writeLayout(grid, grid_length).map(l => l).join("\n"))
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    const msg = await message.channel.send(`> **Tutorial**\n> Objective: **${objectives[current_objective].objectiveREQ}**\n> **${current_objective+1}/${objectives.length}**`, embed)

    while(tutorial_ended === false){
      let filter = m => m.author.id === message.author.id
      let messages
      let first

      messages = await message.channel.awaitMessages(filter, {max: 1})
      m = await messages.first()
      first = await messages.first().content.toLowerCase()

      if(first === objectives[current_objective].end_when_player_reply){

        grid[start_at[0].gridInit].gridUI = start_at[0].gridColored
        grid[start_at[0].gridInit + movement.find(move => move.activeWHEN === first).move].gridUI = start_at[0].gridPlayer

        start_at[0].gridInit = start_at[0].gridInit + movement.find(move => move.activeWHEN === first).move

        const new_embed = new MessageEmbed()
        .setDescription(writeLayout(grid, grid_length).map(l => l).join("\n"))
        .setColor(bot.config.embed_color)
        .setTimestamp()
        .setFooter(`${bot.user.username}`)

        current_objective++
        await m.delete().catch(err => { if(err) console.log(err) })
        if(current_objective >= objectives.length){

          const end_embed = new MessageEmbed()
          .setDescription(`You have completed the Tutorial!\nNow you can bring on your friends and play with them, but first, teach them how to play`)
          .setColor(bot.config.embed_color)
          .setTimestamp()
          .setFooter(`${bot.user.username}`)

          msg.edit(`> **Tutorial**`, end_embed)
          tutorial_ended = true
          return
        }
        msg.edit(`> **Tutorial**\n> Objective: **${objectives[current_objective].objectiveREQ}**\n> **${current_objective+1}/${objectives.length}**`, new_embed)
      }
    }
  }
}

function writeLayout(grid, length){
  let layout = []
  let j = length
  let k = 0
  for(let i = 0; i < grid.length; i+=length){
    layout.push(`${grid.slice(i, j).map((grid, i) => { return `${grid.gridUI}` }).join("")}`)
    j+=length
    k++
  }

  return layout
}