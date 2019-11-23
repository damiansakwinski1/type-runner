module.exports = {
	calculateScore(startTime, endTime) {
		return (endTime - startTime) / 1000;
	}
};
