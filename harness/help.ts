#!/usr/bin/env node

/**
 * Quick help command - shows most common commands
 */

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                 Context Bench - Quick Commands                    ║
╚═══════════════════════════════════════════════════════════════════╝

QUICK START
───────────────────────────────────────────────────────────────────
  npm run list                       List all scenarios
  npm run scenario 1                 Run scenario 1 (baseline)
  npm run scenario 1 all             Run scenario 1 (all configs)

SCENARIOS (use number or alias)
───────────────────────────────────────────────────────────────────
  1  twilio     - Twilio SMS
  2  discord    - Discord Webhook
  3  github     - GitHub Gist
  4  stripe     - Stripe Checkout
  5  vercel     - Vercel Deploy
  6  repo       - GitHub Repo Analysis
  7  openai     - OpenAI Document Q&A
  8  sendgrid   - SendGrid Campaign
  9  slack      - Slack Thread Summary

CONFIGS
───────────────────────────────────────────────────────────────────
  baseline      No MCP (control)
  context7      Context7 MCP
  nia           NIA MCP
  deepcon       DeepCon MCP
  all           Run all configs

OPTIONS
───────────────────────────────────────────────────────────────────
  verbose           verbose logging
  keep              keep workspace
  workers=4         set workers (e.g., workers=4)
  timeout=300       set timeout seconds (e.g., timeout=300)

COMMON COMMANDS
───────────────────────────────────────────────────────────────────
  npm run scenario 1                      Quick test (scenario 1, baseline)
  npm run scenario 1 all verbose         Compare all configs (verbose)
  npm run scenario stripe context7       Stripe with Context7
  npm run scenario stripe all verbose keep   All configs, verbose, keep
  npm run scenario 4 deepcon workers=4   Parallel with 4 workers
  npm run bench:all                      Full benchmark (all scenarios)

DEBUGGING
───────────────────────────────────────────────────────────────────
  npm run scenario 1 baseline verbose keep   Verbose + keep workspace
  npm run scenario 1 baseline timeout=300    Extended timeout (300 sec)

SETUP
───────────────────────────────────────────────────────────────────
  1. Copy .env.example to .env
  2. Add CLAUDE_CODE_OAUTH_TOKEN
  3. Add scenario-specific API keys (see .env.example)
  4. Run: npm run s 1

For full documentation: see README.md
For all CLI options: npm run bench -- --help
`);
