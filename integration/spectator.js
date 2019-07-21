const socket = require('socket.io-client')
const { fromEvent, zip } = require('rxjs')

const delay = (func, time) => {
  setTimeout(func, time)
}

describe('Spectator tests', () => {
  let client1;
  let client2;
  let spectator;

  before(() => {
    client1 = socket('http://localhost:3000')
    client2 = socket('http://localhost:3000')
    spectator = socket('http://localhost:3000')
  })

  it('join game as single user', (done) => {
    const socket1Stream = fromEvent(client1, 'connect')
    const socket2Stream = fromEvent(client2, 'connect')
    const spectatorStteam = fromEvent(client2, 'connect')

    zip(socket1Stream, socket2Stream, spectatorStteam)
      .subscribe((data) => {
        const client1Messages = fromEvent(client1, 'message')
        const client2Messages = fromEvent(client2, 'message')
        const spectatorMessages = fromEvent(spectator, 'message')

        let player1;
        let player2;
        let gameId;
        let text;

        client1Messages.subscribe(data => {
          if (data.type === 'joined-game') {
            player1 = data.payload.players[0].id
            gameId = data.payload.id
          }

          if (data.type === 'text-drawn') {
            text = data.payload.text
          }
        })

        client2Messages.subscribe(data => {
          if (data.type === 'joined-game') {
            player2 = data.payload.players[0].id
          }
        })

        spectatorMessages.subscribe(data => {
          console.log(data)
        })

        spectator.emit('message', {
          type: 'spectate',
        })

        delay(() => client1.emit('message', {
          type: 'join-game',
          payload: {
            name: 'Adam'
          }
        }), 1000),

        delay(() => client2.emit('message', {
          type: 'join-game',
          payload: {
            name: 'John'
          }
        }), 2000)

        delay(() => client1.emit('message', {
          type: 'player-status',
          payload: {
            gameId,
            playerId: player1,
            currentCharacter: 30
          }
        }), 13000)

        delay(() => client2.emit('message', {
          type: 'player-status',
          payload: {
            gameId,
            playerId: player2,
            currentCharacter: 30
          }
        }), 14000)

        delay(() => client1.emit('message', {
          type: 'player-status',
          payload: {
            gameId,
            playerId: player1,
            currentCharacter: 35
          }
        }), 14000)

        delay(() => client2.emit('message', {
          type: 'player-status',
          payload: {
            gameId,
            playerId: player2,
            currentCharacter: 38
          }
        }), 15200)

        delay(() => client1.emit('message', {
          type: 'player-status',
          payload: {
            gameId,
            playerId: player1,
            currentCharacter: text.length
          }
        }), 16000)
      })
  }).timeout(200000)
})