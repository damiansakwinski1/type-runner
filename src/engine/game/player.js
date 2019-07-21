class Player {
  constructor(id, name) {
    this.id = id
    this.name = name
    this.winner = false
    this.currentCharacter = 0;
  }

  update(currentCharacter, hasWon) {
    this.winner = hasWon
    this.currentCharacter = currentCharacter
  }

  isWinner() {
    return this.winner
  }

  getId() {
    return this.id
  }
}

module.exports = Player