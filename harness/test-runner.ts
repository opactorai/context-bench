/**
 * Test runner for scenario validation
 */

import axios from 'axios';
import { ScenarioSpec, TestResult } from './types.js';
import { validateOutput } from './validator.js';
import { Logger } from './logger.js';
import { DEFAULTS } from './constants.js';

/**
 * Run all test cases for a scenario
 */
export async function runTests(
  scenario: ScenarioSpec,
  port: number,
  logger: Logger
): Promise<TestResult[]> {
  logger.marker('>>>>> Running Tests');

  const results: TestResult[] = [];
  const endpoint = `http://localhost:${port}/run`;

  // Get timeout from scenario constraints or use default
  const timeoutMs = scenario.constraints?.timeout_sec
    ? scenario.constraints.timeout_sec * 1000
    : DEFAULTS.TEST_TIMEOUT_MS;

  logger.info(`Test timeout: ${timeoutMs / 1000}s`);

  for (let i = 0; i < scenario.test_inputs.length; i++) {
    const input = scenario.test_inputs[i];
    const testNum = i + 1;

    logger.marker(`>>>>> Test Case ${testNum}/${scenario.test_inputs.length}`);
    logger.info(`Input: ${JSON.stringify(input)}`);

    const result = await runTestCase(
      endpoint,
      input,
      scenario.api.output_schema,
      logger,
      timeoutMs
    );

    results.push(result);

    if (result.validation.pass) {
      logger.marker(`>>>>> Test PASS (${testNum}/${scenario.test_inputs.length})`);
    } else {
      logger.marker(`>>>>> Test FAIL (${testNum}/${scenario.test_inputs.length})`);
      logger.error(`Validation errors: ${JSON.stringify(result.validation.errors)}`);
    }

    // Write test result to JSONL
    logger.jsonl({
      test_num: testNum,
      input: result.input,
      output: result.output,
      validation: result.validation,
      elapsed_ms: result.elapsed_ms,
    });
  }

  logger.marker('>>>>> All Tests Complete');
  const passed = results.filter(r => r.validation.pass).length;
  logger.info(`Results: ${passed}/${results.length} passed`);

  return results;
}

/**
 * Run a single test case
 */
async function runTestCase(
  endpoint: string,
  input: any,
  outputSchema: object,
  logger: Logger,
  timeoutMs: number
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const response = await axios.post(endpoint, input, {
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const output = response.data;
    const elapsed = Date.now() - startTime;

    logger.info(`Output: ${JSON.stringify(output)}`);
    logger.info(`Elapsed: ${elapsed}ms`);

    // Validate output against schema
    logger.marker('>>>>> Validating Output');
    const validation = validateOutput(output, outputSchema);

    if (validation.pass) {
      logger.marker('>>>>> Validation PASS');
    } else {
      logger.marker('>>>>> Validation FAIL');
      logger.error(`Validation errors: ${JSON.stringify(validation.errors)}`);
    }

    return {
      input,
      output,
      validation,
      elapsed_ms: elapsed,
    };
  } catch (error: any) {
    const elapsed = Date.now() - startTime;

    logger.error(`Test case failed: ${error.message}`);

    let errorDetails;
    if (error.response) {
      logger.error(`Response status: ${error.response.status}`);
      logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      errorDetails = {
        status: error.response.status,
        data: error.response.data,
      };
    }

    return {
      input,
      validation: {
        pass: false,
        errors: [{ message: error.message }],
      },
      elapsed_ms: elapsed,
      error: error.message,
      error_details: errorDetails,
    };
  }
}
