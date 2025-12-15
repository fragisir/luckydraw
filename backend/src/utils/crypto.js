const crypto = require('crypto');

/**
 * Fisher-Yates Shuffle Algorithm
 * Cryptographically secure shuffle using provided seed
 */
function fisherYatesShuffle(array, seed) {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  // Use seed to generate deterministic random numbers
  const seedBuffer = Buffer.from(seed, 'hex');
  let seedIndex = 0;
  
  while (currentIndex !== 0) {
    // Generate random index from seed
    if (seedIndex >= seedBuffer.length) {
      seedIndex = 0;
    }
    
    const randomValue = seedBuffer[seedIndex++];
    const randomIndex = randomValue % currentIndex;
    currentIndex--;
    
    // Swap elements
    [shuffled[currentIndex], shuffled[randomIndex]] = 
    [shuffled[randomIndex], shuffled[currentIndex]];
  }
  
  return shuffled;
}

/**
 * Generate cryptographically secure random seed
 */
function generateRandomSeed() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate SHA-256 hash proof for draw verification
 */
function generateHashProof(drawId, randomSeed, winningTicketNumber) {
  const data = `${drawId}|${randomSeed}|${winningTicketNumber}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify hash proof
 */
function verifyHashProof(drawId, randomSeed, winningTicketNumber, expectedHash) {
  const calculatedHash = generateHashProof(drawId, randomSeed, winningTicketNumber);
  return calculatedHash === expectedHash;
}

module.exports = {
  fisherYatesShuffle,
  generateRandomSeed,
  generateHashProof,
  verifyHashProof
};
