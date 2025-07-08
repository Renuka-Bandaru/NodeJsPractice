const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
const result = playerDetails => {
  return {
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
    jerseyNumber: playerDetails.jersey_number,
    role: playerDetails.role,
  }
}

// get players
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
        SELECT *
        FROM cricket_team
        ORDER BY player_id;
    `

  const playerDetails = await db.all(getPlayersQuery)

  response.send(playerDetails.map(eachPlayer => result(eachPlayer)))
})

// post method

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body

  const createPlayer = `
        INSERT INTO
        cricket_team (player_name, jersey_number, role)
        VALUES ( 
            '${playerName}',
            ${jerseyNumber},
            '${role}'
            )
    ;`
  const player = await db.run(createPlayer)
  response.send('Player Added to Team')
})

// get a player

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const getPlayerQuery = `
            SELECT *
            FROM cricket_team
            WHERE player_id = ${playerId};
    
    `
  const player = await db.get(getPlayerQuery)
  const result = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    }
  }
  response.send(result(player))
})

// put request

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body

  const getPlayerQuery = `
        UPDATE  cricket_team
        SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role =  '${role}'
        WHERE player_id = ${playerId};
   `
  await db.run(getPlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const deletePlayerQuery = `
        DELETE 
        FROM cricket_team
        WHERE player_id = ${playerId};
    `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
