/**
 * Scenario implementation validator using GPT-5 reasoning
 */

import OpenAI from 'openai';
import { ScenarioSpec, SpecValidationResult } from './types.js';
import { Logger } from './logger.js';
import fs from 'fs-extra';
import { readFile } from 'fs/promises';
import path from 'path';

const validationSchema = {
  type: 'object',
  properties: {
    pass: {
      type: 'boolean',
      description: 'Whether the implementation correctly follows ALL scenario requirements'
    },
    reasoning: {
      type: 'string',
      description: 'Detailed explanation of why the implementation passes or fails'
    },
    violations: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of specific requirement violations found (empty if pass=true)'
    }
  },
  required: ['pass', 'reasoning', 'violations'],
  additionalProperties: false
} as const;

/**
 * Validate implementation against scenario specification using GPT-5
 */
export async function validateScenarioImplementation(
  scenario: ScenarioSpec,
  workspaceDir: string,
  testResultPath: string,
  logger: Logger
): Promise<SpecValidationResult> {
  logger.marker('>>>>> Validating Implementation');

  if (!process.env.OPENAI_API_KEY) {
    logger.info('OPENAI_API_KEY not set - skipping validation');
    return {
      pass: true,
      reasoning: 'Validation skipped - no OpenAI API key',
      violations: []
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Read implementation files
  const logicPath = path.join(workspaceDir, 'app/logic.ts');
  const logicCode = await readFile(logicPath, 'utf-8');

  // Read test results
  const testResult = await readFile(testResultPath, 'utf-8');

  // Build validation prompt
  const prompt = buildValidationPrompt(scenario, logicCode, testResult);

  try {
    logger.info('Calling GPT-5 for validation...');
    const response = await client.responses.create({
      model: 'gpt-5',
      reasoning: { effort: 'high' },
      input: [
        {
          role: 'system',
          content: `You are an expert code reviewer and API integration specialist.
Your task is to verify that an implementation STRICTLY follows ALL requirements in a scenario specification.

IMPORTANT: Focus on FUNCTIONAL CORRECTNESS, not code quality or style.
- Do NOT evaluate code elegance, performance, or best practices
- Do NOT penalize for verbose code, repeated logic, or suboptimal patterns
- ONLY check if the requirements are correctly implemented and actually working

Be thorough and strict - even minor violations should result in a fail.
Focus on:
1. Whether the implementation actually uses the features/APIs specified in requirements (not faked or hardcoded)
2. Whether output fields come from actual API responses (not constructed/inferred)
3. Whether all required API calls are made correctly
4. Whether the implementation matches the scenario specification
5. Whether the code actually functions and produces correct results (not just looks correct)`
        },
        { role: 'user', content: prompt }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'ValidationResult',
          schema: validationSchema,
          strict: true
        }
      }
    });

    // Extract structured output from response
    // The response.output is an array of ResponseOutputItem
    const firstOutput = response.output[0];
    if (firstOutput && firstOutput.type === 'message') {
      const message = firstOutput as any;
      const firstContent = message.content?.[0];
      if (firstContent && firstContent.type === 'output_text') {
        // Parse the JSON from the text field
        const result = JSON.parse(firstContent.text) as SpecValidationResult;

        if (result.pass) {
          logger.info(`✅ Validation PASSED`);
          logger.info(`Reasoning: ${result.reasoning}`);
        } else {
          logger.info(`❌ Validation FAILED`);
          logger.info(`Reasoning: ${result.reasoning}`);
          logger.info(`Violations: ${result.violations.join(', ')}`);
        }

        return result;
      }
    }

    // Fallback parsing from output_text
    const fallback = response.output_text.trim();
    const parsed = JSON.parse(fallback);
    return parsed as SpecValidationResult;
  } catch (error) {
    logger.error(`Validation error: ${error}`);
    return {
      pass: true, // Don't fail tests due to validator errors
      reasoning: `Validation error: ${error}`,
      violations: []
    };
  }
}

function buildValidationPrompt(
  scenario: ScenarioSpec,
  logicCode: string,
  testResult: string
): string {
  // Build validation criteria section
  const criteriaSection = scenario.validation_criteria
    ? `# Pass/Fail Criteria\n\n${scenario.validation_criteria}\n\n---\n\n`
    : '';

  return `# Scenario Specification

**ID**: ${scenario.id}
**Name**: ${scenario.name}
**Description**: ${scenario.description}

## API Specification

**Endpoint**: ${scenario.api.endpoint}

**Input Schema**:
\`\`\`json
${JSON.stringify(scenario.api.input_schema, null, 2)}
\`\`\`

**Output Schema**:
\`\`\`json
${JSON.stringify(scenario.api.output_schema, null, 2)}
\`\`\`

## Runtime & Constraints

- **Language**: ${scenario.runtime?.language || 'N/A'}
- **Version**: ${scenario.runtime?.version || 'N/A'}
${scenario.constraints ? `- **Timeout**: ${scenario.constraints.timeout_sec}s
- **Memory**: ${scenario.constraints.memory_mb}MB
- **Editable Paths**: ${scenario.constraints.editable_paths?.join(', ') || 'N/A'}` : ''}

## Requirements
${scenario.agent_prompt}

## Test Inputs (Full Test Suite)
\`\`\`json
${JSON.stringify(scenario.test_inputs, null, 2)}
\`\`\`

## Environment Variables
${scenario.env_vars ? Object.keys(scenario.env_vars).map(k => `- ${k}`).join('\n') : 'None'}

---

${criteriaSection}# Implementation

## app/logic.ts
\`\`\`typescript
${logicCode}
\`\`\`

---

# Test Results
${testResult}

---

# Validation Task

Analyze the implementation and test results against the scenario specification${scenario.validation_criteria ? ' and the pass/fail criteria above' : ''}.

**Critical checks:**

1. **Requirement Compliance**: Does the code actually use the features/APIs/parameters specified in requirements?
   - Example: If scenario requires "Deep search", check if code actually uses the correct parameter
   - Example: If scenario requires "hybrid reasoning", check if reasoning mode is enabled in the API call
   - Example: If scenario requires specific model names, check if those exact models are used
   - Verify that all specified features are actually implemented, not skipped or approximated

2. **Output Field Sources**: Do required output fields come from ACTUAL API responses?
   - Example: If output has "searchMetadata", it must be extracted from API response, not constructed
   - Example: If output has "modelConfig", it must reflect parameters used in API call, not hardcoded constants
   - Check for hardcoded fallbacks like: \`if (sources.length === 0) { sources.push({ ... }) }\`
   - Check for constructed fields like: \`{ topic: query }\` instead of extracting from API

3. **API Calls**: Are the correct API endpoints and parameters used?
   - Check model names match requirements exactly
   - Check API parameters are correct as specified in requirements
   - Verify all required API features are utilized

4. **Completeness**: Are ALL requirements from the scenario implemented?

**Return a strict judgment:**
- \`pass: true\` ONLY if the implementation perfectly follows ALL requirements${scenario.validation_criteria ? ' and the pass/fail criteria' : ''}
- \`pass: false\` if ANY requirement is violated, faked, or hardcoded
- Include specific violations with code evidence

Be strict and thorough.`;
}
