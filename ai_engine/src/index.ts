import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { matchingEngine } from './algorithms/matchingEngine';
import { MatchRequest, Worker } from './types';

dotenv.config();

const app = express();
// Keep a local default so the service starts even without environment configuration.
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Matching Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Match workers to user request
 * POST /api/match
 */
app.post('/api/match', (req, res) => {
  try {
    const matchRequest: MatchRequest = req.body.request;
    const workers: Worker[] = req.body.workers;

    if (!matchRequest || !workers) {
      return res.status(400).json({
        error: 'Missing required fields: request and workers'
      });
    }

    // Perform matching
    const matchResult = matchingEngine.matchWorkers(workers, matchRequest);

    // Apply urgency filter if specified
    const finalResult = matchRequest.urgency
      ? matchingEngine.filterByUrgency(matchResult, matchRequest.urgency)
      : matchResult;

    // Get top 10 matches
    const topMatches = matchingEngine.getTopMatches(finalResult, 10);

    res.json({
      success: true,
      data: topMatches,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal matching engine error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get algorithm info
 */
app.get('/api/algorithm/info', (req, res) => {
  res.json({
    name: 'Multi-Factor Weighted Matching',
    version: '1.0.0',
    factors: [
      { name: 'Distance', weight: '30%', description: 'Proximity to user location' },
      { name: 'Rating', weight: '25%', description: 'Worker rating and review count' },
      { name: 'Experience', weight: '15%', description: 'Years of experience and completed jobs' },
      { name: 'Availability', weight: '15%', description: 'Current availability status' },
      { name: 'Skill Match', weight: '10%', description: 'Matching required skills' },
      { name: 'Load Balance', weight: '5%', description: 'Distribution of work' }
    ],
    description: 'Multi-factor scoring algorithm that considers distance, ratings, experience, availability, skills, and load balancing to find the best worker matches.'
  });
});

app.listen(PORT, () => {
  console.log(`🤖 AI Matching Engine running on port ${PORT}`);
  console.log(`📊 Algorithm: Multi-Factor Weighted Matching v1.0`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
