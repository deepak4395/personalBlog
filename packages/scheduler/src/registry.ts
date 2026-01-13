import { runNewsAgent } from '@personalBlog/agent-news';
import { runDIYAgent } from '@personalBlog/agent-diy-tutorials';
import { runBhagavadGitaAgent } from '@personalBlog/agent-bhagavad-gita';
import { configLoader, logger } from '@personalBlog/core';

/**
 * Agent Registry
 * Maps agent names to their runner functions
 */

export type AgentRunner = () => Promise<void>;

export const agentRegistry: Record<string, AgentRunner> = {
  'news-aggregator': runNewsAgent,
  'news': runNewsAgent, // Alias
  'diy-tutorials': runDIYAgent,
  'tutorials': runDIYAgent, // Alias
  'bhagavad-gita': runBhagavadGitaAgent,
  'gita': runBhagavadGitaAgent, // Alias
};

/**
 * Get list of available agents
 */
export function listAgents(): string[] {
  const config = configLoader.loadAgentsConfig();
  return Object.keys(config.agents);
}

/**
 * Check if an agent is enabled
 */
export function isAgentEnabled(agentName: string): boolean {
  const config = configLoader.loadAgentsConfig();
  const agent = (config.agents as any)[agentName];
  return agent?.enabled ?? false;
}

/**
 * Get agent runner by name
 */
export function getAgentRunner(agentName: string): AgentRunner | null {
  // Check direct match
  if (agentRegistry[agentName]) {
    return agentRegistry[agentName];
  }

  // Check with 'agent-' prefix
  const prefixedName = `agent-${agentName}`;
  if (agentRegistry[prefixedName]) {
    return agentRegistry[prefixedName];
  }

  logger.error(`Agent "${agentName}" not found in registry`);
  logger.info(`Available agents: ${Object.keys(agentRegistry).join(', ')}`);
  return null;
}

/**
 * Run a specific agent
 */
export async function runAgent(agentName: string): Promise<void> {
  if (!isAgentEnabled(agentName)) {
    logger.warn(`Agent "${agentName}" is disabled in configuration`);
    return;
  }

  const runner = getAgentRunner(agentName);
  if (!runner) {
    throw new Error(`Agent "${agentName}" not found`);
  }

  logger.info(`Running agent: ${agentName}`);
  const startTime = Date.now();

  try {
    await runner();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`✅ Agent "${agentName}" completed successfully in ${duration}s`);
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.error(`❌ Agent "${agentName}" failed after ${duration}s:`, error);
    throw error;
  }
}

/**
 * Run all enabled agents sequentially
 */
export async function runAllAgents(): Promise<void> {
  const agents = listAgents();
  const enabledAgents = agents.filter((name) => isAgentEnabled(name));

  if (enabledAgents.length === 0) {
    logger.warn('No enabled agents found');
    return;
  }

  logger.info(`Running ${enabledAgents.length} enabled agents: ${enabledAgents.join(', ')}`);

  const results: Array<{ agent: string; success: boolean; error?: any }> = [];

  for (const agentName of enabledAgents) {
    try {
      await runAgent(agentName);
      results.push({ agent: agentName, success: true });
    } catch (error) {
      results.push({ agent: agentName, success: false, error });
      logger.error(`Continuing to next agent after failure...`);
    }
  }

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  logger.info('\n=== Execution Summary ===');
  logger.info(`Total agents: ${results.length}`);
  logger.info(`Successful: ${successful}`);
  logger.info(`Failed: ${failed}`);

  results.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    logger.info(`  ${status} ${result.agent}`);
  });

  if (failed > 0) {
    throw new Error(`${failed} agent(s) failed`);
  }
}
