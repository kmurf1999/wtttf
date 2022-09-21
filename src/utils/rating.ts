function winProb(rating1: number, rating2: number) {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
  );
}

// Function to calculate Elo rating
// K is a constant.
// d determines whether Player A wins
// or Player B.
export function calcRating(Ra: number, Rb: number, K: number, winner: boolean) {
  const Pb = winProb(Ra, Rb);
  const Pa = winProb(Rb, Ra);

  let newRa;
  let newRb;

  // Updating the Elo Ratings
  if (winner === true) {
    newRa = Ra + K * (1 - Pa);
    newRb = Rb + K * (0 - Pb);
  } else {
    newRa = Ra + K * (0 - Pa);
    newRb = Rb + K * (1 - Pb);
  }

  return [newRa, newRb];
}
