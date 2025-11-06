/**
 * Logger for benchmark execution
 * Per-scenario file logging with optional stdout output
 */

import fs from 'fs-extra';
import path from 'path';

export class Logger {
  private logFile: string;
  private verbose: boolean;

  constructor(logDir: string, logFileName: string, verbose = false, append = false) {
    fs.ensureDirSync(logDir);
    this.logFile = path.join(logDir, logFileName);
    this.verbose = verbose;

    // Clear log file unless append mode
    if (!append) {
      fs.writeFileSync(this.logFile, '');
    }
  }

  private write(level: 'INFO' | 'ERROR' | 'DEBUG' | 'WARN', message: string) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logLine = `${timestamp} - ${level} - ${message}\n`;

    fs.appendFileSync(this.logFile, logLine);

    if (this.verbose || level === 'ERROR' || level === 'WARN') {
      console.log(logLine.trim());
    }
  }

  info(message: string) {
    this.write('INFO', message);
  }

  warn(message: string) {
    this.write('WARN', message);
  }

  error(message: string) {
    this.write('ERROR', message);
  }

  debug(message: string) {
    this.write('DEBUG', message);
  }

  marker(marker: string) {
    this.write('INFO', marker);
  }

  /**
   * Write JSONL entry (for tool calls, test results, etc.)
   */
  jsonl(data: any) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, ...data };
    fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');
  }
}

/**
 * Create a logger for a specific scenario run
 */
export function createScenarioLogger(
  runId: string,
  config: string,
  scenarioId: string,
  logFileName: string,
  verbose = false
): Logger {
  const logDir = path.join('logs', 'run_evaluation', runId, config, scenarioId);
  return new Logger(logDir, logFileName, verbose);
}

/**
 * Create a logger for build operations
 */
export function createBuildLogger(
  scenarioId: string,
  logFileName: string,
  verbose = false
): Logger {
  const logDir = path.join('logs', 'build_images', scenarioId);
  return new Logger(logDir, logFileName, verbose);
}

/**
 * Append JSONL entry to a file without clearing it
 * Useful for logging tool calls incrementally
 */
export function appendJsonl(logDir: string, logFileName: string, data: any): void {
  fs.ensureDirSync(logDir);
  const logFile = path.join(logDir, logFileName);
  const timestamp = new Date().toISOString();
  const entry = { timestamp, ...data };
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}
