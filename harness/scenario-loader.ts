/**
 * Scenario YAML loader - supports new package-based structure
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { PackageSpec, ScenarioSpec, ScenarioItem, ScenarioIdentifier } from './types.js';
import { PATHS } from './constants.js';

/**
 * Parse scenario identifier (package:scenario or legacy format)
 */
export function parseScenarioId(input: string): ScenarioIdentifier | null {
  if (input.includes(':')) {
    const [packageId, scenarioId] = input.split(':');
    return {
      packageId: packageId.trim(),
      scenarioId: scenarioId.trim(),
      fullId: input,
    };
  }
  return null;
}

/**
 * Load a package specification from YAML file
 */
export function loadPackage(packageId: string): PackageSpec {
  // Try different file name patterns
  const patterns = [
    `${packageId}.yaml`,
    `${packageId.replace(':', '-')}.yaml`,
  ];

  // Also try numbered patterns (01-package-id.yaml)
  const files = fs.readdirSync(PATHS.SCENARIOS_DIR).filter(f => f.endsWith('.yaml'));
  const matchingFile = files.find(f => {
    const baseName = path.basename(f, '.yaml');
    // Match either "01-package-id" or "package-id"
    return baseName === packageId || baseName.endsWith(`-${packageId}`) || baseName === packageId.replace(/^\d+-/, '');
  });

  let packagePath: string;
  if (matchingFile) {
    packagePath = path.join(PATHS.SCENARIOS_DIR, matchingFile);
  } else {
    // Fallback to direct match
    packagePath = path.join(PATHS.SCENARIOS_DIR, patterns[0]);
  }

  if (!fs.existsSync(packagePath)) {
    throw new Error(`Package not found: ${packageId} (tried ${packagePath})`);
  }

  const content = fs.readFileSync(packagePath, 'utf-8');
  const spec = yaml.load(content) as PackageSpec;

  // Validate required fields
  if (!spec['package-id'] || !spec.scenarios || !Array.isArray(spec.scenarios)) {
    throw new Error(`Invalid package spec: ${packageId} - missing required fields`);
  }

  return spec;
}

/**
 * Load a specific scenario from a package
 */
export function loadScenario(scenarioInput: string): ScenarioSpec {
  const parsed = parseScenarioId(scenarioInput);

  if (!parsed) {
    throw new Error(`Invalid scenario format: ${scenarioInput}. Expected format: package-id:scenario-id`);
  }

  const pkg = loadPackage(parsed.packageId);
  const scenarioItem = pkg.scenarios.find(s => s.id === parsed.scenarioId);

  if (!scenarioItem) {
    throw new Error(`Scenario not found: ${parsed.scenarioId} in package ${parsed.packageId}`);
  }

  // Convert PackageSpec + ScenarioItem to ScenarioSpec (legacy format for runner)
  const scenario: ScenarioSpec = {
    id: parsed.fullId,
    name: `${pkg['package-id']}: ${scenarioItem.id}`,
    description: scenarioItem.query,
    runtime: {
      language: pkg.language,
      version: pkg.runtime.version,
    },
    api: {
      endpoint: 'POST /run',
      output_schema: {}, // Will be loaded from oracle
    },
    agent_prompt: scenarioItem.query,
    test_inputs: [{ query: scenarioItem.query }],
    env_vars: pkg.env_vars,
    constraints: {
      timeout_sec: 180,
      memory_mb: 1024,
      editable_paths: ['app/logic.ts', 'package.json'],
    },
  };

  return scenario;
}

/**
 * List all packages
 */
export function listPackages(): PackageSpec[] {
  const scenariosDir = PATHS.SCENARIOS_DIR;

  if (!fs.existsSync(scenariosDir)) {
    return [];
  }

  const files = fs.readdirSync(scenariosDir).filter(f => f.endsWith('.yaml') && f !== 'INDEX.md');
  const packages: PackageSpec[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(scenariosDir, file), 'utf-8');
      const spec = yaml.load(content) as PackageSpec;

      // Validate it's a package spec (not legacy)
      if (spec['package-id'] && Array.isArray(spec.scenarios)) {
        packages.push(spec);
      }
    } catch (error) {
      // Skip invalid files
    }
  }

  return packages;
}

/**
 * List all scenarios across all packages
 */
export function listScenarios(): Array<{ packageId: string; scenario: ScenarioItem; fullId: string }> {
  const packages = listPackages();
  const scenarios: Array<{ packageId: string; scenario: ScenarioItem; fullId: string }> = [];

  for (const pkg of packages) {
    for (const scenario of pkg.scenarios) {
      scenarios.push({
        packageId: pkg['package-id'],
        scenario,
        fullId: `${pkg['package-id']}:${scenario.id}`,
      });
    }
  }

  return scenarios;
}

/**
 * Get all package IDs
 */
export function getPackageIds(): string[] {
  const packages = listPackages();
  return packages.map(p => p['package-id']);
}

/**
 * Get all scenario IDs in format "package-id:scenario-id"
 */
export function getScenarioIds(): string[] {
  return listScenarios().map(s => s.fullId);
}

/**
 * Get all scenarios for a specific package
 */
export function getPackageScenarios(packageId: string): string[] {
  const pkg = loadPackage(packageId);
  return pkg.scenarios.map(s => `${pkg['package-id']}:${s.id}`);
}
