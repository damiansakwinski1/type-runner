const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { Subject } = require('rxjs')
const Handlers = require('./engine/handlers')
const JoinGame = require('./engine/handler/join-game')
const PlayerStatus = require('./engine/handler/player-status')
const Spectate = require('./engine/handler/spectate')
const Highscores = require('./engine/handler/highscores')
const Games = require('./engine/games')

const messagesToSocketStream$ = new Subject()

const games = new Games()

const handlers = new Handlers({
  'join-game': new JoinGame(games, messagesToSocketStream$),
  'player-status': new PlayerStatus(games, messagesToSocketStream$),
  'spectate': new Spectate(games, messagesToSocketStream$),
  'highscores': new Highscores(games, messagesToSocketStream$)
})

const filterMessages = messages => message => {
  if (messages.find(filteredMessage => filteredMessage === message.type)) {
    return false
  }

  return true
}

const spectatorMessages = filterMessages([
  'joined-game'
])

io.on('connection', socket => {
  socket.on('message', message => {
    handlers.handle({
      ...message,
      socketId: socket.id
    })
  })

  socket.on('disconnect', () => {
    games.removePlayerFromOpenGames(socket.id)
  })
});

messagesToSocketStream$.subscribe(message => {
  message.target.forEach(id => {
    io.to(id).emit('message', {
      type: message.type,
      payload: message.payload
    })
  })

  if (spectatorMessages(message)) {
    games.spectators.forEach(spectator => {
      io.to(spectator).emit('message', {
        type: message.type,
        payload: message.payload
      })
    })
  }
})

http.listen(3000, () => {
  console.log('listening on port 3000')
})