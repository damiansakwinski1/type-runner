const OpenGame = require("./open-game");
const Player = require("../player");
const { states } = require("../game-state");
const { v4 } = require("uuid");
const { equal, notEqual } = require("assert");
const { delay } = require("../../../tests/delay");
const InMemoryRepository = require("../../../tests/in-memory-repository.js");

describe("Open Game", () => {
  it("is open for players if there is less than maxiumum players and state not COUNTDOWN", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const game = new OpenGame(gameConfig, InMemoryRepository());

    equal(game.openForPlayers(), true);

    game.state = states.COUNTDOWN;
    game.addPlayer(new Player(v4(), "John"));
    game.addPlayer(new Player(v4(), "Tom"));

    equal(game.openForPlayers(), false);
  });

  it("is open for players when WAITING_FOR_PLAYERS state", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const game = new OpenGame(gameConfig, InMemoryRepository());

    equal(game.openForPlayers(), true);

    game.addPlayer(new Player(v4(), "John"));
    game.addPlayer(new Player(v4(), "Tom"));

    equal(game.openForPlayers(), true);
  });

  it("returns true when has enough players to start a game", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const game = new OpenGame(gameConfig, InMemoryRepository());

    equal(game.hasEnoughPlayers(), false);

    game.addPlayer(new Player(v4(), "John"));
    game.addPlayer(new Player(v4(), "Tom"));

    equal(game.hasEnoughPlayers(), true);
  });

  it("returns true when not in WAITING_FOR_PLAYERS state", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const game = new OpenGame(gameConfig, InMemoryRepository());

    equal(game.isRunning(), false);

    game.state = states.COUNTDOWN;

    equal(game.isRunning(), true);
  });

  it("returns true when there is player with specific id", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const game = new OpenGame(gameConfig, InMemoryRepository());
    const playerId = v4();
    const unknownPlayerId = v4();

    equal(game.hasPlayer(unknownPlayerId), false);

    game.addPlayer(new Player(playerId, "John"));

    equal(game.hasPlayer(playerId), true);
  });

  it("returns true when current character is the last in text", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const game = new OpenGame(gameConfig, InMemoryRepository());
    game.text = "some-text";

    equal(game.hasFinished(0), false);
    equal(game.hasFinished(game.text.length), true);
  });

  it("removes player", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const playerId = v4();
    const game = new OpenGame(gameConfig, InMemoryRepository());
    game.addPlayer(new Player(playerId, "John"));

    equal(game.hasPlayer(playerId), true);

    game.removePlayer(playerId);

    equal(game.hasPlayer(playerId), false);
  });

  it("changes state back to WAITING_FOR_PLAYERS if not enough players after remove and COUNTDOWN state", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const playerId = v4();
    const game = new OpenGame(gameConfig, InMemoryRepository());
    game.addPlayer(new Player(playerId, "John"));
    game.state = states.COUNTDOWN;

    game.removePlayer(playerId);

    equal(game.state, states.WAITING_FOR_PLAYERS);
  });

  it("updates player state", () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 5000,
      PRE_LOCK_COUNTDOWN: 10000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    const playerId = v4();
    const game = new OpenGame(gameConfig, InMemoryRepository());
    game.addPlayer(new Player(playerId, "John"));
    game.text = "some-text";

    equal(game.isWinner(playerId), false);

    game.updatePlayerStatus(playerId, game.text.length);

    equal(game.isWinner(playerId), true);
  });

  it("emits all expected pre-game events", done => {
    const gameConfig = {
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 1000,
      PRE_LOCK_COUNTDOWN: 2000,
      GAME_TICK: 30000,
      MAX_GAME_TICKS: 6
    };

    let currentCountdown =
      gameConfig.LOCK_COUNTDOWN / 1000 + gameConfig.PRE_LOCK_COUNTDOWN / 1000;

    const playerId = v4();
    const game = new OpenGame(gameConfig, InMemoryRepository());

    const countdownTimeout = setTimeout(
      () => equal(1, 0, "Countdown tick event not fired"),
      1500
    );
    const gameLockedTimeout = setTimeout(
      () => equal(1, 0, "Game locked event not fired"),
      2500
    );
    const countdownFinishedTimeout = setTimeout(
      () => equal(1, 0, "Countdown finished event not fired"),
      3500
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
    game.startPreLockCountdown();
  }).timeout(3500);

  it("emits all expected game events", done => {
    const gameConfig = {
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 1000,
      PRE_LOCK_COUNTDOWN: 2000,
      GAME_TICK: 1000,
      MAX_GAME_TICKS: 2
    };

    let ticksCountdown = 0;

    const playerId = v4();
    const game = new OpenGame(gameConfig, InMemoryRepository());

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

  it("stops countdown when there is not enough players", async () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 2,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 1000,
      PRE_LOCK_COUNTDOWN: 2000,
      GAME_TICK: 1000,
      MAX_GAME_TICKS: 2
    };

    const playerId = v4();
    const game = new OpenGame(gameConfig, InMemoryRepository());

    game.on("game-locked", () => {
      equal(1, 0, "Game shouldn't be locked");
    });

    game.addPlayer(new Player(playerId, "John"));
    game.addPlayer(new Player(v4(), "John"));
    game.startPreLockCountdown();
    game.removePlayer(playerId);
  }).timeout(3500);

  it("stops the game when there is a winner", async () => {
    const gameConfig = {
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 1000,
      PRE_LOCK_COUNTDOWN: 2000,
      GAME_TICK: 1000,
      MAX_GAME_TICKS: 4
    };

    const playerId = v4();
    const game = new OpenGame(gameConfig, InMemoryRepository());
    game.text = "some-text";

    game.on("game-time-finished", () => {
      equal(1, 0, "Game time shouldn't finish on its own");
    });

    game.addPlayer(new Player(playerId, "John"));
    game.startGameTime();

    await delay(2);
    game.updatePlayerStatus(playerId, game.text.length);
  }).timeout(3500);

  it("calls fame-finished event and save winner score to repository", done => {
    const gameConfig = {
      MINIMUM_PLAYERS: 1,
      MAXIMUM_PLAYERS: 2,
      LOCK_COUNTDOWN: 1000,
      PRE_LOCK_COUNTDOWN: 2000,
      GAME_TICK: 1000,
      MAX_GAME_TICKS: 4
    };
    const repository = InMemoryRepository();
    const playerId = v4();
    const game = new OpenGame(gameConfig, repository);

    game.text = "some-text";

    game.on("game-finished", async () => {
      equal((await repository.getHighScores()).length, 1);
      done();
    });

    game.addPlayer(new Player(playerId, "John"));
    game.updatePlayerStatus(playerId, game.text.length);
    game.finish();
  });
});
