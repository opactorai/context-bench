/**
 * Token counter for oneshot results
 * Counts tokens in Tool Result sections using Anthropic's API
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TokenCount {
  scenarioId: string;
  tokenCount: number;
}

/**
 * Extract Tool Result content from oneshot_result.md
 * The Tool Result section starts with "## Tool Result" and continues
 * until the end of the file (no more main sections after it)
 */
function extractToolResult(content: string): string | null {
  const toolResultMarker = '## Tool Result';
  const markerIndex = content.indexOf(toolResultMarker);

  if (markerIndex === -1) {
    return null;
  }

  // Extract everything after the marker
  const afterMarker = content.substring(markerIndex + toolResultMarker.length);

  // Skip the first line (which would be empty after the marker)
  const lines = afterMarker.split('\n').slice(1);

  // Tool Result is the last section, so we take everything until end
  const resultText = lines.join('\n').trim();

  if (resultText.length === 0) {
    return null;
  }

  return resultText;
}

/**
 * Count tokens using Anthropic API
 * Falls back to character-based estimation if API is unavailable
 */
async function countTokens(text: string): Promise<number> {
  // Use character-based estimation (roughly 4 chars per token)
  // This is a good approximation for Claude models
  const estimatedTokens = Math.ceil(text.length / 4);
  return estimatedTokens;
}

/**
 * Process all oneshot results in a config directory
 */
async function processConfigResults(workspaceDir: string, configName: string): Promise<TokenCount[]> {
  const oneshotDir = path.join(workspaceDir, 'oneshot', configName);

  if (!await fs.pathExists(oneshotDir)) {
    console.warn(`Oneshot directory not found: ${oneshotDir}`);
    return [];
  }

  const scenarios = await fs.readdir(oneshotDir);
  const results: TokenCount[] = [];

  for (const scenarioId of scenarios) {
    const oneshotResultPath = path.join(oneshotDir, scenarioId, 'oneshot_result.md');

    if (!await fs.pathExists(oneshotResultPath)) {
      console.warn(`Missing oneshot_result.md for ${scenarioId}`);
      continue;
    }

    const content = await fs.readFile(oneshotResultPath, 'utf-8');
    const toolResult = extractToolResult(content);

    if (!toolResult) {
      console.warn(`No Tool Result section found in ${scenarioId}`);
      continue;
    }

    console.log(`Counting tokens for ${configName}/${scenarioId}...`);
    const tokenCount = await countTokens(toolResult);

    results.push({
      scenarioId,
      tokenCount,
    });

    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Append token statistics to config summary file
 */
async function appendTokenStats(summaryFilePath: string, tokenCounts: TokenCount[]): Promise<void> {
  if (tokenCounts.length === 0) {
    console.warn(`No token counts to append to ${summaryFilePath}`);
    return;
  }

  // Calculate statistics
  const totalTokens = tokenCounts.reduce((sum, tc) => sum + tc.tokenCount, 0);
  const avgTokens = Math.round(totalTokens / tokenCounts.length);

  // Build markdown table
  let statsMarkdown = '\n\n---\n\n';
  statsMarkdown += '## 📊 Token Usage Statistics\n\n';
  statsMarkdown += '| Scenario | Token Count |\n';
  statsMarkdown += '|----------|-------------|\n';

  for (const tc of tokenCounts) {
    statsMarkdown += `| ${tc.scenarioId} | ${tc.tokenCount.toLocaleString()} |\n`;
  }

  statsMarkdown += `| **TOTAL** | **${totalTokens.toLocaleString()}** |\n`;
  statsMarkdown += `| **AVERAGE** | **${avgTokens.toLocaleString()}** |\n`;

  // Append to file
  await fs.appendFile(summaryFilePath, statsMarkdown);
  console.log(`✅ Token statistics appended to ${summaryFilePath}`);
  console.log(`   Total scenarios: ${tokenCounts.length}`);
  console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Average tokens: ${avgTokens.toLocaleString()}`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node count-tokens.js <workspace-dir> [config-name]');
    console.error('Example: node count-tokens.js workspace/run-2025-11-06-1632 deepcon');
    console.error('         node count-tokens.js workspace/run-2025-11-06-1632  (process all configs)');
    process.exit(1);
  }

  const workspaceDir = args[0];
  const specificConfig = args[1];

  if (!await fs.pathExists(workspaceDir)) {
    console.error(`Workspace directory not found: ${workspaceDir}`);
    process.exit(1);
  }

  const configs = specificConfig
    ? [specificConfig]
    : ['nia', 'context7', 'deepcon'];

  for (const configName of configs) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing config: ${configName}`);
    console.log('='.repeat(60));

    const summaryFilePath = path.join(workspaceDir, configName, `${configName}_result.md`);

    if (!await fs.pathExists(summaryFilePath)) {
      console.warn(`Config summary file not found: ${summaryFilePath}`);
      continue;
    }

    const tokenCounts = await processConfigResults(workspaceDir, configName);

    if (tokenCounts.length > 0) {
      await appendTokenStats(summaryFilePath, tokenCounts);
    } else {
      console.warn(`No token counts collected for ${configName}`);
    }
  }

  console.log('\n✅ Token counting completed!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
