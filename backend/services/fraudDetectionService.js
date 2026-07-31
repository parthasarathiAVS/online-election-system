class FraudDetectionService {
  constructor() {
    this.voteAttempts = new Map(); // IP -> timestamps
  }

  analyzeVoteAttempt(ipAddress, studentId, deviceAgent) {
    let score = 0;
    let alerts = [];

    // 1. Rapid requests from same IP
    const now = Date.now();
    const attempts = this.voteAttempts.get(ipAddress) || [];
    const recentAttempts = attempts.filter(time => now - time < 60000); // last minute
    recentAttempts.push(now);
    this.voteAttempts.set(ipAddress, recentAttempts);

    if (recentAttempts.length > 5) {
      score += 50;
      alerts.push('Rapid voting attempts detected from this IP address.');
    }

    // 2. Suspicious Device Agent
    if (!deviceAgent || deviceAgent.includes('PostmanRuntime') || deviceAgent.includes('curl')) {
      score += 40;
      alerts.push('Suspicious or non-standard device agent detected.');
    }

    return {
      isFraudulent: score >= 50,
      score,
      alerts
    };
  }
}

module.exports = new FraudDetectionService();
