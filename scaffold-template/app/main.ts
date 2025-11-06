/**
 * Fixed HTTP server - DO NOT EDIT
 * Agent should only edit logic.ts
 */

import express from 'express';
import dotenv from 'dotenv';
import { execute } from './logic.js';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Main endpoint - calls agent-implemented execute function
 */
app.post('/run', async (req, res) => {
  try {
    const result = await execute(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error executing request:', error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});
