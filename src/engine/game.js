const { states } = require('./game-state')
const { v4 } = require('uuid')
const { EventEmitter } = require('events')
const { texts } = require('../../texts')

const MINIMUM_PLAYERS = 2
const MAXIMUM_PLAYERS = 4
const COUNTDOWN_LENGTH = 5000

class Game extends EventEmitter {
  constructor() {
    super()
    this.id = v4()
    this.players = []
    this.state = states.WAITING_FOR_PLAYERS
    this.countdown = null
    this.text = null
    this.startTime = 0
  }

  getId() {
    return this.id
  }

  getPlayers() {
    return this.players
  }

  getPlayer(id) {
    return this.players.find(player => player.getId() === id)
  }

  openForPlayers() {
    return this.state === states.WAITING_FOR_PLAYERS || this.state === states.COUNTDOWN && this.players.length < MAXIMUM_PLAYERS
  }

  hasEnoughPlayers() {
    return this.players.length >= MINIMUM_PLAYERS
  }

  isRunning() {
    return this.state !== states.WAITING_FOR_PLAYERS
  }

  addPlayer(player) {
    this.players.push(player)
  }

  hasPlayer(playerId) {
    return this.players.find(player => player.getId() === playerId) !== undefined
  }

  hasFinished(currentCharacter) {
    return currentCharacter === this.text.length
  }

  removePlayer(playerId) {
    this.players = this.players.filter(player => player.id !== playerId)

    if (this.players < MINIMUM_PLAYERS && this.state === states.COUNTDOWN) {
      this.stopCountdown()
      this.state = states.WAITING_FOR_PLAYERS
    }
  }

  startCountdown() {
    this.state = states.COUNTDOWN

    this.countdown = setTimeout(() => {
      this.lock()
      this.text = texts[Math.floor(Math.random() * Math.random() * texts.length)]
      this.emit('game-locked', this.text)
    }, COUNTDOWN_LENGTH)
  }

  stopCountdown() {
    clearTimeout(this.countdown)
    this.countdown = null
  }

  lock() {
    this.state = states.LOCKED

    this.countdown = null;
    setTimeout(() => {
      this.emit('countdown-finished', this.text)
      this.startTime = Date.now()
    }, COUNTDOWN_LENGTH)
  }

  updatePlayerStatus(playerId, currentCharacter) {
    const player = this.players.find(player => player.getId() === playerId)
    player.update(currentCharacter, this.text.length === currentCharacter)
  }
}

module.exports = Game