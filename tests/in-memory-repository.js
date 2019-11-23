module.exports = () => {
  const scores = [];

  return {
    async getHighScores() {
      return scores;
    },
    async addHighScore(name, score) {
      scores.push({
        name,
        score
      });
    }
  };
};
