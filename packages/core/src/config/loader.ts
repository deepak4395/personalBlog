import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yaml';
import { execSync } from 'child_process';
import { AgentsConfigSchema, SecretsSchema, AgentsConfig, Secrets } from '';
import { logger } from '';

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
   * Load agents configuration from YAML file
   */
  loadAgentsConfig(configPath: string = './config/agents.yaml'): AgentsConfig {
    if (this.agentsConfig) {
      return this.agentsConfig;
    }

    try {
      const fullPath = resolve(process.cwd(), configPath);
      
      if (!existsSync(fullPath)) {
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
      const fullPath = resolve(
        process.cwd(),
        secretsPath || agentsConfig.secretsFile || './config/secrets.enc.yaml'
      );

      if (!existsSync(fullPath)) {
        throw new Error(`Secrets file not found: ${fullPath}`);
      }

      logger.info(`Loading secrets from: ${fullPath}`);

      // Check if file is encrypted (contains 'sops:' metadata)
      const rawContent = readFileSync(fullPath, 'utf-8');
      const isEncrypted = rawContent.includes('sops:') || rawContent.includes('ENC[');

      let decryptedContent: string;

      if (isEncrypted) {
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
