/**
 * Port pool manager for parallel execution
 * Manages port allocation from 3010-3090 range
 * Uses file-based locking to support multiple processes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

// File-based port allocation state
const PORT_STATE_FILE = path.join(process.cwd(), '.port-allocation.json');
const PORT_LOCK_FILE = path.join(process.cwd(), '.port-allocation.lock');

interface PortState {
  allocatedPorts: Record<string, number>; // containerId -> port
  lastUpdated: number;
}

export class PortManager {
  private static instance: PortManager;
  private availablePorts: Set<number>;
  private allocatedPorts: Map<string, number>; // containerId -> port
  private allocationLock: Promise<void> = Promise.resolve();

  private constructor() {
    // Initialize port pool (3010-3090)
    this.availablePorts = new Set();
    for (let port = 3010; port <= 3090; port++) {
      this.availablePorts.add(port);
    }
    this.allocatedPorts = new Map();

    // Load existing allocations from file
    this.loadPortState();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PortManager {
    if (!PortManager.instance) {
      PortManager.instance = new PortManager();
    }
    return PortManager.instance;
  }

  /**
   * Load port state from file (cross-process synchronization)
   * Also cleans up stale allocations
   */
  private loadPortState(): void {
    try {
      if (fs.existsSync(PORT_STATE_FILE)) {
        const state: PortState = fs.readJsonSync(PORT_STATE_FILE);

        // Load allocated ports from file
        for (const [containerId, port] of Object.entries(state.allocatedPorts)) {
          this.allocatedPorts.set(containerId, port);
          this.availablePorts.delete(port);
        }
      }
    } catch (error) {
      // Ignore errors, start fresh
      console.warn('Warning: Could not load port state file:', error);
    }
  }

  /**
   * Clean up stale allocations (containers that no longer exist)
   */
  private async cleanupStaleAllocations(): Promise<void> {
    try {
      // Get list of all Docker containers (running and stopped)
      const { stdout } = await execAsync('docker ps -a --format "{{.ID}}"');
      const existingContainers = new Set(
        stdout
          .trim()
          .split('\n')
          .filter(id => id.length > 0)
      );

      // Find stale allocations
      const staleContainers: string[] = [];
      const now = Date.now();
      const TEMP_ID_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

      for (const containerId of this.allocatedPorts.keys()) {
        // Check for stale temp IDs (older than 5 minutes)
        if (containerId.startsWith('temp-')) {
          const match = containerId.match(/^temp-(\d+)-/);
          if (match) {
            const timestamp = parseInt(match[1]);
            if (now - timestamp > TEMP_ID_TIMEOUT_MS) {
              staleContainers.push(containerId);
              console.log(`Found stale temp-ID allocation (${Math.floor((now - timestamp) / 1000)}s old): ${containerId}`);
            }
          }
          continue;
        }

        // Check if container exists
        const shortId = containerId.substring(0, 12);
        let exists = false;
        for (const existingId of existingContainers) {
          if (existingId.startsWith(shortId) || shortId.startsWith(existingId)) {
            exists = true;
            break;
          }
        }

        if (!exists) {
          staleContainers.push(containerId);
        }
      }

      // Release stale allocations
      for (const containerId of staleContainers) {
        const port = this.allocatedPorts.get(containerId);
        this.allocatedPorts.delete(containerId);
        if (port !== undefined) {
          this.availablePorts.add(port);
        }
        const displayId = containerId.startsWith('temp-') ? containerId : containerId.substring(0, 12);
        console.log(`Cleaned up stale port allocation for ${displayId} (port ${port})`);
      }

      // Save cleaned state
      if (staleContainers.length > 0) {
        this.savePortState();
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Warning: Could not clean up stale allocations:', error);
    }
  }

  /**
   * Save port state to file (cross-process synchronization)
   */
  private savePortState(): void {
    try {
      const state: PortState = {
        allocatedPorts: Object.fromEntries(this.allocatedPorts),
        lastUpdated: Date.now(),
      };
      fs.writeJsonSync(PORT_STATE_FILE, state, { spaces: 2 });
    } catch (error) {
      console.warn('Warning: Could not save port state file:', error);
    }
  }

  /**
   * Acquire file lock (simple implementation)
   */
  private async acquireFileLock(): Promise<() => void> {
    // Wait for lock file to be removed
    let attempts = 0;
    const MAX_ATTEMPTS = 200; // 200 * 50ms = 10 seconds
    const STALE_LOCK_TIMEOUT_MS = 10000; // 10 seconds

    while (fs.existsSync(PORT_LOCK_FILE) && attempts < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }

    if (attempts >= MAX_ATTEMPTS) {
      // Force remove stale lock (older than 10 seconds)
      try {
        const stats = fs.statSync(PORT_LOCK_FILE);
        const lockAge = Date.now() - stats.mtimeMs;

        if (lockAge > STALE_LOCK_TIMEOUT_MS) {
          // Check if the process that created the lock is still alive
          const lockPid = parseInt(fs.readFileSync(PORT_LOCK_FILE, 'utf-8'));
          let processExists = false;

          try {
            // Check if process exists (signal 0 doesn't kill, just checks)
            process.kill(lockPid, 0);
            processExists = true;
          } catch (e) {
            // Process doesn't exist
            processExists = false;
          }

          if (!processExists) {
            console.warn(`Removing stale lock file (${lockAge}ms old, PID ${lockPid} not found)`);
            fs.removeSync(PORT_LOCK_FILE);
          } else {
            console.warn(`Lock file is old (${lockAge}ms) but process ${lockPid} still exists, waiting...`);
            // Wait a bit more
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (e) {
        // Ignore errors reading lock file
      }
    }

    // Create lock file with PID
    fs.writeFileSync(PORT_LOCK_FILE, process.pid.toString());

    // Return release function
    return () => {
      try {
        // Only remove if it's our lock
        const currentPid = fs.readFileSync(PORT_LOCK_FILE, 'utf-8');
        if (parseInt(currentPid) === process.pid) {
          fs.removeSync(PORT_LOCK_FILE);
        }
      } catch (e) {
        // Ignore
      }
    };
  }

  /**
   * Check if a port is actually free on the system
   * Also checks Docker to see if any container is using it
   */
  private async isSystemPortFree(port: number): Promise<boolean> {
    try {
      // Check system-level port usage
      await execAsync(`lsof -i :${port}`);
      // If lsof succeeds, port is in use
      return false;
    } catch (error) {
      // lsof failed (port appears free), but double-check Docker
      try {
        // Check if any Docker container (running or not) has this port bound
        const { stdout } = await execAsync(
          `docker ps -a --format "{{.Ports}}" | grep ":${port}->" || true`
        );
        if (stdout.trim()) {
          // Port is allocated to a Docker container
          return false;
        }
      } catch (dockerError) {
        // Docker check failed, assume port is free
      }
      return true;
    }
  }

  /**
   * Allocate a port for a container
   * Returns the assigned port or throws if no ports available
   * Thread-safe with mutex lock and cross-process file lock
   */
  public async allocatePort(containerId: string): Promise<number> {
    // Acquire file lock first (cross-process)
    const releaseFileLock = await this.acquireFileLock();

    try {
      // Reload state from file to get latest allocations from other processes
      this.loadPortState();

      // Clean up stale allocations (containers that no longer exist)
      await this.cleanupStaleAllocations();

      // Wait for any ongoing allocation to complete (in-process mutex)
      await this.allocationLock;

      // Create new lock for this allocation
      let releaseLock: () => void;
      this.allocationLock = new Promise(resolve => {
        releaseLock = resolve;
      });

      try {
        if (this.availablePorts.size === 0) {
          throw new Error('No available ports in range 3010-3090');
        }

        // Try to find a port that's both in our pool and actually free on the system
        const availablePortArray = Array.from(this.availablePorts);
        let assignedPort: number | null = null;

        for (const port of availablePortArray) {
          const isFree = await this.isSystemPortFree(port);
          if (isFree) {
            assignedPort = port;
            break;
          } else {
            // Port is in our pool but actually in use - remove it from available pool
            console.warn(`Warning: Port ${port} was in pool but is actually in use, removing from available ports`);
            this.availablePorts.delete(port);
          }
        }

        if (assignedPort === null) {
          throw new Error('No free ports available - all ports in pool are in use by system');
        }

        // Mark as allocated
        this.availablePorts.delete(assignedPort);
        this.allocatedPorts.set(containerId, assignedPort);

        // Save state to file for other processes
        this.savePortState();

        return assignedPort;
      } finally {
        // Release in-process lock
        releaseLock!();
      }
    } finally {
      // Release file lock
      releaseFileLock();
    }
  }

  /**
   * Release a port when container is stopped
   */
  public async releasePort(containerId: string): Promise<void> {
    const releaseFileLock = await this.acquireFileLock();

    try {
      // Reload state
      this.loadPortState();

      const port = this.allocatedPorts.get(containerId);
      if (port !== undefined) {
        this.allocatedPorts.delete(containerId);
        this.availablePorts.add(port);

        // Save state
        this.savePortState();
      }
    } finally {
      releaseFileLock();
    }
  }

  /**
   * Get current port allocation status
   */
  public getStatus(): {
    available: number;
    allocated: number;
    total: number;
  } {
    return {
      available: this.availablePorts.size,
      allocated: this.allocatedPorts.size,
      total: 81, // 3010-3090 = 81 ports
    };
  }

  /**
   * Check if a specific port is available
   */
  public isPortAvailable(port: number): boolean {
    return this.availablePorts.has(port);
  }

  /**
   * Get allocated port for a container (if any)
   */
  public getPortForContainer(containerId: string): number | undefined {
    return this.allocatedPorts.get(containerId);
  }

  /**
   * Reassign a port from one container ID to another
   * Used when replacing temporary ID with actual container ID
   */
  public async reassignPort(oldId: string, newId: string): Promise<void> {
    const releaseFileLock = await this.acquireFileLock();

    try {
      // Reload state from file
      this.loadPortState();

      const port = this.allocatedPorts.get(oldId);
      if (port !== undefined) {
        this.allocatedPorts.delete(oldId);
        this.allocatedPorts.set(newId, port);

        // Save state to file for cross-process synchronization
        this.savePortState();
      }
    } finally {
      releaseFileLock();
    }
  }

  /**
   * Reset all allocations (for cleanup)
   * Also clears the file-based state
   */
  public async reset(): Promise<void> {
    const releaseFileLock = await this.acquireFileLock();

    try {
      this.availablePorts.clear();
      for (let port = 3010; port <= 3090; port++) {
        this.availablePorts.add(port);
      }
      this.allocatedPorts.clear();

      // Clear file state
      try {
        if (fs.existsSync(PORT_STATE_FILE)) {
          fs.removeSync(PORT_STATE_FILE);
        }
      } catch (error) {
        console.warn('Warning: Could not remove port state file:', error);
      }
    } finally {
      releaseFileLock();
    }
  }
}
