const {MessageEmbed} = require("discord.js")
const fs = require("fs")
const ms = require("ms")
const Duration = require("humanize-duration")
module.exports={
  name: "start",
  category: "controller",
  description: "Let the fun begin! Let's see who will win",
  aliases: ["begin"],
  isBeta: false,
  run: async(bot, message, args) =>{
    
    let able = false
    const nf_embed = new MessageEmbed()
    .setDescription(`${bot.db.messages.err}\n> \`You're not in a game\``)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    let gameCode = ""

    bot.games.forEach(game =>{
      if(game.gamePlayersJoined.includes(message.author.id)){
        able = true
        gameCode = game.gameCode
      }
    })

    if(able === false) return message.channel.send(`> **Oops**`, nf_embed)

    let game = await bot.games.get(gameCode)

    const nh_embed = new MessageEmbed()
    .setDescription(`${bot.db.messages.err}\n> \`You're not the Host of the actual game\``)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    if(game.gameHost !== message.author.id) return message.channel.send(`> **Oops!**`, nh_embed)

    const nep_embed = new MessageEmbed()
    .setDescription(`${bot.db.messages.err}\n> \`Needed 2 players or more to start the game\``)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    if(game.gamePlayersJoined.length < 2) return message.channel.send(`> **Oops!**`, nep_embed) 

    const starting_embed = new MessageEmbed()
    .setDescription(`Game will now start in 5 seconds\nRemember to: **Have fun with your friends or with anyone who are playing with you!**`)
    .setColor(bot.config.embed_color)
    .setTimestamp()
    .setFooter(`${bot.user.username}`)

    const msg = await message.channel.send(`> **Starting..**`, starting_embed)

    setTimeout(async function(){

      await msg.delete()
      game.gameInit = (Date.now() + ms(game.gameDuration)) //Set the remaining time to be displayed in every round
      game.gamePlaying = true

      let gridLength = game.gameGridLength
      let turn = 0

      let gameEnded = false

      let positions = [
      ]

      let grid = []
      for(let i = 0; i < gridLength*gridLength; i++){
        grid.push({
          gridLOC: i,
          gridUI: `<:sq_grid:836361555221676052>`
        })
      }

      if(game.gamePowers.enabled === "yes"){
        game.gamePowers.powers.forEach(power =>{
          for(let i = 0; i < power.instances; i++){
            let setAt = Math.floor(Math.random() * grid.length)
            grid[setAt].gridUI = power.identifier
          }
        })
      }
      

      for(let i = 0; i < game.gamePlayersJoined.length; i++){
        if(i === 0) positions.push(
          {
            gridInit: 0,
            gridPlayer: `<:sq_redpl:836362607786197056>`,
            gridColored: `<:sq_gridred:836361887880708148>`,
            gridPlayerId: game.gamePlayersJoined[i]
          }
        )

        if(i === 1) positions.push(
          {
            gridInit: grid.length-1,
            gridPlayer: `<:sq_bluepl:836362493126508585>`,
            gridColored: `<:sq_gridblue:836361795739320363>`,
            gridPlayerId: game.gamePlayersJoined[i]
          }
        )

        if(i === 2) positions.push(
          {
            gridInit: gridLength-1,
            gridPlayer: `<:sq_greenpl:836362679232495668>`,
            gridColored: `<:sq_gridgreen:836362055426375680>`,
            gridPlayerId: game.gamePlayersJoined[i]
          }
        )

        if(i === 3) positions.push(
          {
            gridInit: grid.length-gridLength,
            gridPlayer: `<:sq_yellowpl:836362816536707102>`,
            gridColored: `<:sq_gridyellow:836362140658302987>`,
            gridPlayerId: game.gamePlayersJoined[i]
          }
        )
      }

      grid.forEach(grid =>{
        positions.some(pl =>{
          if(grid.gridLOC === pl.gridInit){
            grid.gridUI = pl.gridColored
            bot.db.data.find(user => user.userID === pl.gridPlayerId).connection.firstLast = new Intl.DateTimeFormat("en-us").format(Date.now())
            bot.db.data.find(user => user.userID === pl.gridPlayerId).profile.gamesPlayed++
            if(bot.db.data.find(user => user.userID === pl.gridPlayerId).connection.firstPlayed === null) bot.db.data.find(user => user.userID === pl.gridPlayerId).connection.firstPlayed = new Intl.DateTimeFormat("en-us").format(Date.now())
          }
        })
      })

      const embed = new MessageEmbed()
      .setDescription(`${writeLayout(grid, gridLength).map(l => l).join("\n")}`)
      .addFields(
        {name: `Time Remaining`, value: `${Duration(game.gameInit - Date.now(), {units:["m", "s"], largest: 1, round: true})}`}
      )
      .setColor(bot.config.embed_color)
      .setTimestamp()
      .setFooter(`${bot.user.username}`)

      const msg1 = await message.channel.send(`> **Game**\n> Turn of: **${message.guild.members.cache.get(positions[turn].gridPlayerId).user.tag}**`, embed)

      //Winners when time's up
      setTimeout(async function(){
        if(gameEnded === false){
          gameEnded = true
          
          let playersGRID = []
          for(let i = 0; i < positions.length; i++){
            playersGRID.push({
              gridPlayerId: positions[i].gridPlayerId,
              gridIdentifier: positions[i].gridColored,
              gridCount: 0
            })
          }
          grid.forEach(grid =>{
            playersGRID.some(pl =>{
              if(pl.gridIdentifier === grid.gridUI){
                pl.gridCount++
              }
            })
          })

          playersGRID = playersGRID.sort((a, b) => b.gridCount - a.gridCount)
          for(let i = 0; i < game.gameWinners; i++){
            const data = await bot.db.data.find(user => user.userID === playersGRID[i].gridPlayerId)
            let newBadges = []
            if(data){
              //Update profile data
              data.profile.gamesWon++

              //Leveling
              data.leveling.xp += Math.floor(Math.random() * 100)
              if(data.leveling.xp >= data.leveling.nxp){
                const member = await message.guild.members.cache.get(data.userID)

                data.leveling.xp = 0
                data.leveling.lvl++
                data.leveling.nxp = (data.leveling.lvl * 150)

                //Unlocking
                bot.db.unlocks.forEach(unlock =>{
                  if(data.leveling.lvl >= unlock.lvl){
                    if(!data.profile.badge.badges.includes(unlock.badge)){
                      data.profile.badge.badges.push(unlock.badge)
                      newBadges.push(unlock.badge)
                    }
                  }
                })
                
                if(member){
                  member.send(`> **Level UP!**`, {
                    embed:{
                      description: `Congratulations **${member.user.username}**!\nYou have leveled up to level **${data.leveling.lvl}**\n> You can unlock some awesome badges if you keep leveling up like that!${newBadges.length > 0 ? `\n\n**Wow!**\nLooks like you have unlocked some new badges: ${newBadges.map(bg => { return `${bg}` }).join(" / ")}` : ``}`,
                      color: bot.config.embed_color,
                      timestamp: Date.now(),
                      footer: { text: `${bot.user.username}`}
                    }
                  })
                }
              }
            }
          }
          for(let i = playersGRID.length-1; i >= game.gameWinners; i--){
            const data = await bot.db.data.find(user => user.userID === playersGRID[i].gridPlayerId)
            if(data){
              data.profile.gamesLost++
            }
          }

          fs.writeFile(`./base/db.json`, JSON.stringify(bot.db), (err) => {  if(err) console.log(err) })

          message.channel.send(`> **Game**\n> Winner(s): **${playersGRID.slice(0, game.gameWinners).map(pl => { return `${message.guild.members.cache.get(pl.gridPlayerId) ? message.guild.members.cache.get(pl.gridPlayerId).user.tag : `Unknown player`}` }).join(" / ")}**`, {
            embed:{
              description: `Hey!\nLooks like we have our winner(s), it is **${playersGRID.slice(0, game.gameWinners).map(pl => { return `${message.guild.members.cache.get(pl.gridPlayerId) ? message.guild.members.cache.get(pl.gridPlayerId).user.tag : `Unknown player`}` }).join(" / ")}** congratulations!\n\nI hope you had fun!\nIf you want to play again, run the command **${bot.config.prefix}start**`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          })
        }
        
        game.gamePlaying = false
        fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
      }, ms(game.gameDuration))

      while(gameEnded === false){
        let filter = m => m.author.id === positions[turn].gridPlayerId
        let messages
        let first

        let movement = [
          { activeWhen: `up`, move: -gridLength },
          { activeWhen: `down`, move: gridLength },
          { activeWhen: `left`, move: -1 },
          { activeWhen: `right`, move: 1 },
        ]

        messages = await message.channel.awaitMessages(filter, {max: 1})
        m = await messages.first()
        first = await messages.first().content.toLowerCase()

        if(gameEnded) return

        if(!movement.some(move => move.activeWhen === first)) return m.delete()

        grid[positions[turn].gridInit].gridUI = positions[turn].gridColored

        if(grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move]){
          if(grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move].gridUI === "<:sq_gridbomb:836362899299237898>"){
            //Paths
            let paths = [-(gridLength+1), -gridLength, -(gridLength-1), -1, 1, (gridLength-1), gridLength, (gridLength+1)]
            paths.forEach(path =>{
              if(grid[(positions[turn].gridInit + movement.find(move => move.activeWhen === first).move + path)]) grid[(positions[turn].gridInit + movement.find(move => move.activeWhen === first).move + path)].gridUI = positions[turn].gridColored
              //console.log(grid.find(g => g.gridLOC === (start_at[turn].gridInit + movement.find(move => move.activeWHEN === first).move + path))) //Test if there are paths
            })
            grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move] ? bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.powersTaken++ : bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.powersTaken
          }else if(grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move].gridUI === "<:sq_gridlr:836363037027467324>"){
            let paths = [-2, -1, 1, 2]
            paths.forEach(path =>{
              if(grid[(positions[turn].gridInit + movement.find(move => move.activeWhen === first).move + path)]) grid[(positions[turn].gridInit + movement.find(move => move.activeWhen === first).move + path)].gridUI = positions[turn].gridColored
            })
            grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move] ? bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.powersTaken++ : bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.powersTaken
          }else if(grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move].gridUI === "<:sq_gridud:836363125682339920>"){
            let paths = [-(gridLength*2), -(gridLength), (gridLength), (gridLength*2)]
            paths.forEach(path =>{
              if(grid[(positions[turn].gridInit + movement.find(move => move.activeWhen === first).move + path)]) grid[(positions[turn].gridInit + movement.find(move => move.activeWhen === first).move + path)].gridUI = positions[turn].gridColored
            })
            grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move] ? bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.powersTaken++ : bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.powersTaken
          }
        }else{
          message.channel.send(`> **Oops!**`, {
            embed:{
              description: `You're going outside the grid!\nIs now the turn of the next player`,
              color: bot.config.embed_color,
              timestamp: Date.now(),
              footer: { text: `${bot.user.username}`}
            }
          }).then(m => { m.delete({timeout: 5000}) })
        }

        grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move] ? grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move].gridUI = positions[turn].gridPlayer : positions[turn].gridInit

        positions[turn].gridInit = grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move] ? positions[turn].gridInit + movement.find(move => move.activeWhen === first).move : positions[turn].gridInit

        grid[positions[turn].gridInit + movement.find(move => move.activeWhen === first).move] ? bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.gridsColored++ : bot.db.data.find(user => user.userID === positions[turn].gridPlayerId).profile.gridsColored

        const newEmbed = new MessageEmbed()
        .setDescription(`${writeLayout(grid, gridLength).map(l => l).join("\n")}`)
        .addFields(
          {name: `Time Remaining`, value: `${Duration(game.gameInit - Date.now(), {units:["m", "s"], largest: 1, round: true})}`}
        )
        .setColor(bot.config.embed_color)
        .setTimestamp()
        .setFooter(`${bot.user.username}`)

        await m.delete()
        //#endregion

        //Check for eliminations
        
        let playersGrid = []
        for(let i = 0; i < positions.length; i++){
          playersGrid.push({
            gridPlayerId: positions[i].gridPlayerId,
            gridIdentifier: positions[i].gridColored,
            gridCount: 0
          })
        }
        grid.forEach(grid =>{
          playersGrid.some(pl =>{
            if(pl.gridIdentifier === grid.gridUI){
              pl.gridCount++
            }
          })
        })

        let newPlayers = []
        playersGrid.forEach(async pl =>{
          if(pl.gridCount > 0) {
            newPlayers.push(
              {
                gridInit: positions.find(pl_ => pl_.gridPlayerId === pl.gridPlayerId).gridInit,
                gridPlayer: positions.find(pl_ => pl_.gridPlayerId === pl.gridPlayerId).gridPlayer,
                gridColored: positions.find(pl_ => pl_.gridPlayerId === pl.gridPlayerId).gridColored,
                gridPlayerId: pl.gridPlayerId
              }
            )
          }else{
            const data = await bot.db.data.find(user => user.userID === pl.gridPlayerId)
            if(data){
              data.profile.gamesLost++
              fs.writeFile(`./base/db.json`, JSON.stringify(bot.db), (err) => {  if(err) console.log(err) })
            }
          }
        })

        positions = newPlayers

        if(positions.length === game.gameWinners){

          positions.forEach(async pl =>{
            const data = await bot.db.data.find(user => user.userID === pl.gridPlayerId)
            let newBadges = []
            if(data){
              //Updating profile data
              data.profile.gamesWon++

              //Leveling
              data.leveling.xp += Math.floor(Math.random() * 100)
              if(data.leveling.xp >= data.leveling.nxp){
                const member = await message.guild.members.cache.get(data.userID)

                data.leveling.xp = 0
                data.leveling.lvl++
                data.leveling.nxp = (data.leveling.lvl * 150)

                //Unlocking
                bot.db.unlocks.forEach(unlock =>{
                  if(data.leveling.lvl >= unlock.lvl){
                    if(!data.profile.badge.badges.includes(unlock.badge)){
                      data.profile.badge.badges.push(unlock.badge)
                      newBadges.push(unlock.badge)
                    }
                  }
                })
                
                if(member){
                  member.send(`> **Level UP!**`, {
                    embed:{
                      description: `Congratulations **${member.user.username}**!\nYou have leveled up to level **${data.leveling.lvl}**\n> You can unlock some awesome badges if you keep leveling up like that!${newBadges.length > 0 ? `\n\n**Wow!**\nLooks like you have unlocked some new badges: ${newBadges.map(bg => { return `${bg}` }).join(" / ")}` : ``}`,
                      color: bot.config.embed_color,
                      timestamp: Date.now(),
                      footer: { text: `${bot.user.username}`}
                    }
                  })
                }
              }

              fs.writeFile(`./base/db.json`, JSON.stringify(bot.db), (err) => {  if(err) console.log(err) })
            }
          })

          const endEmbed = new MessageEmbed()
          .setDescription(`Hey!\nLooks like we have our winner(s), it is **${positions.map(pl => { return `${message.guild.members.cache.get(pl.gridPlayerId) ? message.guild.members.cache.get(pl.gridPlayerId).user.tag : `Unknown player`}` }).join(" / ")}** congratulations!\n\nI hope you had fun!\nIf you want to play again, run the command **${bot.config.prefix}start**`)
          .setColor(bot.config.embed_color)
          .setTimestamp()
          .setFooter(`${bot.user.username}`)

          message.channel.send(endEmbed)

          gameEnded = true

          msg1.edit(`> **Game**\n> Winner(s): **${positions.map(pl => { return `${message.guild.members.cache.get(pl.gridPlayerId) ? message.guild.members.cache.get(pl.gridPlayerId).user.tag : `Unknown player`}` }).join(" / ")}**`, newEmbed)
          game.gamePlaying = false
          return
        }
        //#endregion

        turn++
        if(turn > positions.length-1) turn = 0
        msg1.edit(`> **Game**\n> Turn of: **${message.guild.members.cache.get(positions[turn].gridPlayerId).user.tag}**`, newEmbed)
      }
    }, 5000)
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