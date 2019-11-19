const { states } = require("./game-state");
const { v4 } = require("uuid");
const { EventEmitter } = require("events");
const { texts } = require("../../texts");

const MINIMUM_PLAYERS = 2;
const MAXIMUM_PLAYERS = 4;
const LOCK_COUNTDOWN = 5000;
const PRE_LOCK_COUNTDOWN = 10000;
const GAME_TICK = 30000;
const MAX_GAME_TICKS = 6;

class Game extends EventEmitter {
  constructor() {
    super();
    this.id = v4();
    this.players = [];
    this.state = states.WAITING_FOR_PLAYERS;
    this.text = null;
    this.startTime = 0;
    this.countdownTimeout = null;
    this.gameTimeout = null;
    this.currentCountdown = (LOCK_COUNTDOWN + PRE_LOCK_COUNTDOWN) / 1000;
    this.maxGameLength = (GAME_TICK / 1000) * MAX_GAME_TICKS;
    this.gameLength = (GAME_TICK / 1000) * MAX_GAME_TICKS;
    this.winner = null;
  }

  getId() {
    return this.id;
  }

  getPlayers() {
    return this.players;
  }

  getPlayer(id) {
    return this.players.find(player => player.getId() === id);
  }

  openForPlayers() {
    return (
      this.state === states.WAITING_FOR_PLAYERS ||
      (this.state === states.COUNTDOWN && this.players.length < MAXIMUM_PLAYERS)
    );
  }

  hasEnoughPlayers() {
    return this.players.length >= MINIMUM_PLAYERS;
  }

  isRunning() {
    return this.state !== states.WAITING_FOR_PLAYERS;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  hasPlayer(playerId) {
    return (
      this.players.find(player => player.getId() === playerId) !== undefined
    );
  }

  hasFinished(currentCharacter) {
    return currentCharacter === this.text.length;
  }

  removePlayer(playerId) {
    this.players = this.players.filter(player => player.id !== playerId);

    if (this.players < MINIMUM_PLAYERS && this.state === states.COUNTDOWN) {
      this.stopCountdown();
      this.state = states.WAITING_FOR_PLAYERS;
    }
  }

  startPreLockCountdown() {
    this.state = states.COUNTDOWN;
    this.currentCountdown = (LOCK_COUNTDOWN + PRE_LOCK_COUNTDOWN) / 1000;

    const handlePreLockTimeout = () => {
      this.currentCountdown -= 1;

      this.emit("countdown-tick", this.currentCountdown);

      if (this.currentCountdown > 5) {
        this.countdownTimeout = setTimeout(handlePreLockTimeout, 1000);
      } else {
        this.lock();
      }
    };

    this.countdownTimeout = setTimeout(handlePreLockTimeout, 1000);
  }

  stopCountdown() {
    clearTimeout(this.countdownTimeout);
    this.emit("countdown-stopped");
    this.countdownTimeout = null;
    this.currentCountdown = (PRE_LOCK_COUNTDOWN + LOCK_COUNTDOWN) / 1000;
  }

  lock() {
    this.state = states.LOCKED;
    this.text = texts[Math.floor(Math.random() * texts.length)];
    this.emit("game-locked", this.text);

    const handleLockTimeout = () => {
      this.currentCountdown -= 1;

      this.emit("countdown-tick", this.currentCountdown);

      if (this.currentCountdown > 0) {
        this.countdownTimeout = setTimeout(handleLockTimeout, 1000);
      } else {
        this.emit("countdown-finished", this.text);
        this.startTime = Date.now();
        this.countdownTimeout = null;
      }
    };

    this.countdownTimeout = setTimeout(handleLockTimeout, 1000);
  }

  startGameTime() {
    const handleSyncTimeout = () => {
      this.gameLength -= GAME_TICK / 1000;

      this.emit("game-time-tick", this.gameLength);

      if (this.gameLength > 0) {
        this.gameTimeout = setTimeout(handleSyncTimeout, GAME_TICK);
      } else {
        this.emit("game-time-finished");
      }
    };

    setTimeout(handleSyncTimeout, GAME_TICK);
  }

  isWinner(playerId) {
    return this.winner && this.winner.getId() === playerId;
  }

  updatePlayerStatus(playerId, currentCharacter) {
    const player = this.players.find(player => player.getId() === playerId);
    if (player) {
      player.update(currentCharacter, this.text.length === currentCharacter);

      if (player.isWinner()) {
        this.winner = player;
        clearTimeout(this.gameTimeout);
      }

      return true;
    }

    return false;
  }
}

module.exports = Game;
