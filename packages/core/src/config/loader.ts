import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yaml';
import { execSync } from 'child_process';
import { AgentsConfigSchema, SecretsSchema, AgentsConfig, Secrets } from './schemas.js';
import { logger } from '../utils/logger.js';

/**
 * Configuration Loader
 * Loads and validates configuration from YAML files
 * Decrypts secrets using SOPS
 */

export class ConfigLoader {
  private static instance: ConfigLoader;
  private agentsConfig?: AgentsConfig;
  private secrets?: Secrets;

  private constructor() {}

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Find the workspace root by looking for pnpm-workspace.yaml
   */
  private findWorkspaceRoot(): string {
    let currentDir = process.cwd();
    const maxLevels = 5; // Safety limit
    
    for (let i = 0; i < maxLevels; i++) {
      if (existsSync(resolve(currentDir, 'pnpm-workspace.yaml'))) {
        return currentDir;
      }
      const parentDir = resolve(currentDir, '..');
      if (parentDir === currentDir) break; // Reached filesystem root
      currentDir = parentDir;
    }
    
    // Fallback to current directory
    return process.cwd();
  }

  /**
   * Load agents configuration from YAML file
   */
  loadAgentsConfig(configPath: string = './config/agents.yaml'): AgentsConfig {
    if (this.agentsConfig) {
      return this.agentsConfig;
    }

    try {
      const workspaceRoot = this.findWorkspaceRoot();
      const fullPath = resolve(workspaceRoot, configPath);
      
      if (!existsSync(fullPath)) {
        logger.error(`Agents config file not found at: ${fullPath}`);
        logger.error(`Current working directory: ${process.cwd()}`);
        logger.error(`Workspace root: ${workspaceRoot}`);
        throw new Error(`Agents config file not found: ${fullPath}`);
      }

      logger.info(`Loading agents config from: ${fullPath}`);
      const fileContent = readFileSync(fullPath, 'utf-8');
      const rawConfig = parse(fileContent);

      // Validate with Zod
      this.agentsConfig = AgentsConfigSchema.parse(rawConfig);
      logger.info('Agents config loaded and validated successfully');

      return this.agentsConfig;
    } catch (error) {
      logger.error('Failed to load agents config:', error);
      throw error;
    }
  }

  /**
   * Load and decrypt secrets using SOPS
   */
  loadSecrets(secretsPath?: string): Secrets {
    if (this.secrets) {
      return this.secrets;
    }

    try {
      // Get secrets path from agents config or use default
      const agentsConfig = this.agentsConfig || this.loadAgentsConfig();
      const workspaceRoot = this.findWorkspaceRoot();
      
      // Try unencrypted first (GitHub Actions), then encrypted (local)
      const unencryptedPath = resolve(workspaceRoot, './config/secrets.yaml');
      const encryptedPath = resolve(
        workspaceRoot,
        secretsPath || agentsConfig.secretsFile || './config/secrets.enc.yaml'
      );
      
      let fullPath: string;
      let isEncrypted = false;
      
      if (existsSync(unencryptedPath)) {
        fullPath = unencryptedPath;
        logger.info(`Using unencrypted secrets file: ${fullPath}`);
      } else if (existsSync(encryptedPath)) {
        fullPath = encryptedPath;
        isEncrypted = true;
        logger.info(`Using encrypted secrets file: ${fullPath}`);
      } else {
        logger.error(`Secrets file not found at: ${unencryptedPath} or ${encryptedPath}`);
        logger.error(`Current working directory: ${process.cwd()}`);
        throw new Error(`Secrets file not found: ${unencryptedPath} or ${encryptedPath}`);
      }

      logger.info(`Loading secrets from: ${fullPath}`);

      // Read and check if file is encrypted
      const rawContent = readFileSync(fullPath, 'utf-8');
      const needsDecryption = isEncrypted && (rawContent.includes('sops:') || rawContent.includes('ENC['));

      let decryptedContent: string;

      if (needsDecryption) {
        // Use SOPS to decrypt
        logger.info('Decrypting secrets with SOPS...');
        try {
          decryptedContent = execSync(`sops -d "${fullPath}"`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
          });
        } catch (error: any) {
          logger.error('SOPS decryption failed. Make sure SOPS is installed and age key is configured.');
          logger.error('Install SOPS: https://github.com/getsops/sops');
          logger.error('Set SOPS_AGE_KEY_FILE or SOPS_AGE_KEY environment variable');
          throw new Error(`SOPS decryption failed: ${error.message}`);
        }
      } else {
        // File is not encrypted (development mode)
        logger.warn('⚠️  WARNING: Secrets file is not encrypted! This should only be used in development.');
        decryptedContent = rawContent;
      }

      // Parse and validate
      const rawSecrets = parse(decryptedContent);
      this.secrets = SecretsSchema.parse(rawSecrets);
      
      logger.info('Secrets loaded and validated successfully');
      return this.secrets;
    } catch (error) {
      logger.error('Failed to load secrets:', error);
      throw error;
    }
  }

  /**
   * Get a specific secret value by path
   */
  getSecret(path: string): any {
    const secrets = this.secrets || this.loadSecrets();
    const parts = path.split('.');
    let value: any = secrets;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) {
        throw new Error(`Secret not found: ${path}`);
      }
    }

    return value;
  }

  /**
   * Clear cached configuration (useful for testing)
   */
  clearCache(): void {
    this.agentsConfig = undefined;
    this.secrets = undefined;
  }
}

// Singleton instance
export const configLoader = ConfigLoader.getInstance();
