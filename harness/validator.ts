/**
 * Schema validator using AJV
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationResult } from './types.js';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Validate output against JSON schema
 */
export function validateOutput(output: any, schema: object): ValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(output);

  return {
    pass: valid,
    errors: validate.errors || [],
  };
}

/**
 * Validate that all required environment variables are set
 */
export function validateEnvVars(required: Record<string, string>): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  for (const [key, template] of Object.entries(required)) {
    // Extract variable name from template (e.g., "${STRIPE_KEY}" -> "STRIPE_KEY")
    const match = template.match(/\$\{(\w+)\}/);
    if (match) {
      const envVar = match[1];
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Resolve environment variable templates
 */
export function resolveEnvVars(templates: Record<string, string>): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [key, template] of Object.entries(templates)) {
    const match = template.match(/\$\{(\w+)\}/);
    if (match) {
      const envVar = match[1];
      resolved[key] = process.env[envVar] || '';
    } else {
      resolved[key] = template;
    }
  }

  return resolved;
}
