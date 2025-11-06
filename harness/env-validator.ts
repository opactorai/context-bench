/**
 * Environment variable validation with helpful error messages
 */

import chalk from 'chalk';
import { ScenarioSpec } from './types.js';
import { validateEnvVars } from './validator.js';

/**
 * Validate environment variables for a scenario
 * Returns true if valid, exits process if invalid
 */
export function validateScenarioEnv(scenario: ScenarioSpec): boolean {
  if (!scenario.env_vars || Object.keys(scenario.env_vars).length === 0) {
    return true;
  }

  const result = validateEnvVars(scenario.env_vars);

  if (!result.valid) {
    console.log('\n' + chalk.red('━'.repeat(80)));
    console.log(chalk.red.bold('ERROR: Missing required environment variables'));
    console.log(chalk.red('━'.repeat(80)) + '\n');

    console.log('The following environment variables are required but not set:\n');
    result.missing.forEach(varName => {
      console.log(chalk.yellow(`  • ${varName}`));
    });

    console.log('\nTo fix this, set the environment variables:\n');
    result.missing.forEach(varName => {
      console.log(chalk.cyan(`  export ${varName}="your_value_here"`));
    });

    console.log('\nOr create a .env file:\n');
    result.missing.forEach(varName => {
      console.log(chalk.cyan(`  ${varName}=your_value_here`));
    });

    console.log('\nThen run the benchmark again.\n');
    console.log(`See scenario file for details: ${chalk.blue(`scenarios/${scenario.id}.yaml`)}\n`);
    console.log(chalk.red('━'.repeat(80)) + '\n');

    return false;
  }

  return true;
}
