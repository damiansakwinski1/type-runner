# Supported messages

## Messages format

Each message must be sent and recivied on `message` channel from `socket.io`. 

Each message has a format of:

```
{
  type: <message-type>,
  payload: {
    ...<message-payload>
  }
}
```

## Incoming

### join-game - in order to join / create game

```
{
  type: 'join-game',
  payload: {
    name: <username>
  }
}
```

### join-practice - in order to join practice game

```
{
  type: 'join-practice',
  payload: {
    name: <username>
  }
}
```

### player-status - in order to update status of a player for other users

```
{
  type: 'player-status',
  payload: {
    gameId: <game-id>,
    playerId: <player-id>,
    currentCharacter: <last-valid-character>
  }
}
```

### highscores - in order to get current highscorews

```
{
  type: 'highscores',
}
```

### spectate - in order to connect as spectator

```
{
  type: 'spectate',
}
```

## Outcoming

### joined-game - after you joined a game

```
{
  type: 'joined-game',
  payload: {
    id: <game-id>,
    countdown: <length-of-countdownd-in-seconds>,
    players: [
      {
        id: <plaayer-id>,
        name: <name-of-a-player>,
        winner: false,
        currentCharacter: 0
      }
    ]
  }
}
```

### player-joined - after new player joined

```
{
  type: 'player-joined',
  payload: {
    gameId: <game-id>,
    player: {
      id: <player-id>,
      name: <player-name>,
      winner: false,
      currentCharacter: 0
    }
  }
}
```

### start-countdown - after there is enough player to start a game

```
{
  type: 'start-countdown',
  payload: {
    gameId: <game-id>,
    countdown: <length-in-seconds>
  }
}
```

### countdown-tick - after every tick of countdown

```
{
  type: 'countdown-tick',
  payload: {
    gameId: <game-id>,
    countdown: <length-in-seconds>
  }
}
```

### game-time-sync - after every tick of game time length, used for synchro

```
{
  type: 'game-time-sync',
  payload: {
    gameId: <game-id>,
    gameLength: <left-time-in-seconds>
  }
}
```

### text-drawn - after random text was drawn

```
{
  type: 'text-drown',
  payload: {
    gameId: <game-id>,
    text: <text-to-be-typed>,
    maxGameLength: <game-length-in-seconds>
  }
}
```

### start-game - after everything is ready and users are able to type

```
{
  type: 'start-game',
  payload: {
    gameId: <game-id>,
    gameType: 'normal' | 'practice',
  }
}
```

### game-status - information about gaame status

```
{
  type: 'game-status',
  payload: {
    gameId: <game-id>,
    players: [
      {
        id: <player-id>,
        currentCharacter: <current-character-of-a-player>,
        winner: true|false
      }
    ]
  }
}
```

### player-finished - when one player finished

```
{
  type: 'player-finished',
  payload: {
    gameId: <game-id>,
    playerId: <player-id>,
    winner: true,
    score: <number-of-seconds>
  }
}
```

### highscores - current highscores

```
{
  type: 'highscores ',
  scores: [
    {
      name: <username>,
      score: <number-of-seconds>
    }
  ]
}
```

### left-game - after player left game

```
{
  type: 'left-game',
  payload: {
    gameId: <game-id>,
    playerId: <player-id>,
    stopCountdown: <true | false>
  }
}
```
