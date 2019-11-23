const PracticeGame = require("./practice-game");
const Player = require("../player");
const { states } = require("../game-state");
const { v4 } = require("uuid");
const { equal, notEqual } = require("assert");
const { delay } = require("../../../tests/delay");
const InMemoryRepository = require("../../../tests/in-memory-repository.js");

describe("Practice Game", () => {
  it("emits all expected pre-game events", done => {
    const playerId = v4();

    const gameConfig = {
      GAME_TICK: 1000,
      MAX_GAME_TICKS: 6,
      LOCK_COUNTDOWN: 2000,
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 1
    };

    let currentCountdown = 2;
    const game = new PracticeGame(gameConfig);

    const countdownTimeout = setTimeout(
      () => equal(1, 0, "Countdown tick event not fired"),
      1500
    );
    const gameLockedTimeout = setTimeout(
      () => equal(1, 0, "Game locked event not fired"),
      1500
    );
    const countdownFinishedTimeout = setTimeout(
      () => equal(1, 0, "Countdown finished event not fired"),
      2500
    );

    game
      .on("countdown-tick", countdown => {
        currentCountdown--;
        equal(countdown, currentCountdown);
        clearTimeout(countdownTimeout);
      })
      .on("game-locked", text => {
        notEqual(text, null);
        notEqual(game.text, null);
        clearTimeout(gameLockedTimeout);
      })
      .on("countdown-finished", text => {
        notEqual(text, null);
        clearTimeout(countdownFinishedTimeout);
        done();
      });

    game.addPlayer(new Player(playerId, "John"));
    game.lock();
  }).timeout(4000);

  it("emits all expected game events", done => {
    const gameConfig = {
      GAME_TICK: 1000,
      MAX_GAME_TICKS: 2,
      LOCK_COUNTDOWN: 1000,
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 1
    };

    let ticksCountdown = 0;

    const playerId = v4();
    const game = new PracticeGame(gameConfig);

    const gameTickTimeout = setTimeout(
      () => equal(1, 0, "Game time tick event not fired"),
      1500
    );
    const gameFinishedTimeout = setTimeout(
      () => equal(1, 0, "Game time finished event not fired"),
      2500
    );

    game
      .on("game-time-tick", () => {
        ticksCountdown++;
        equal(ticksCountdown <= gameConfig.MAX_GAME_TICKS, true);
        clearTimeout(gameTickTimeout);
      })
      .on("game-time-finished", () => {
        clearTimeout(gameFinishedTimeout);
        done();
      });

    game.addPlayer(new Player(playerId, "John"));
    game.startGameTime();
  }).timeout(3000);
});
