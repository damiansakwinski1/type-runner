const Player = require("./player");
const { v4 } = require("uuid");
const { equal } = require("assert");

describe("Player", () => {
  it("updated player", () => {
    const player = new Player(v4(), "John");

    player.update(30, true);

    equal(player.isWinner(), true);
    equal(player.currentCharacter, 30);
  });
});
