export function winProbability(ratingA: number, ratingB: number) {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (ratingA - ratingB)) / 400))
  );
}

// 0 = player1 wins, 1 = player2 wins
// 30 is the example k value
export function calcElo(
  ratingA: number,
  ratingB: number,
  k: number,
  winner: 0 | 1
) {
  const probA = winProbability(ratingA, ratingB);
  const probB = winProbability(ratingB, ratingA);
  if (winner === 0) {
    return ratingA + k * (1 - probA), ratingB + k * (0 - probB);
  }
  return ratingA + k * (0 - probA), ratingB + k * (1 - probB);
}
