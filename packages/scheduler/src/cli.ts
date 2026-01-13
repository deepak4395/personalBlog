#!/usr/bin/env node

import { Command } from 'commander';
import { configLoader, logger } from '@personalBlog/core';
import { runAgent, runAllAgents, listAgents, isAgentEnabled } from './registry.js';

/**
 * CLI for running AI agents
 */

const program = new Command();

program
  .name('agents')
  .description('AI agents scheduler for content generation')
  .version('1.0.0');

program
  .command('run-agent <agent>')
  .description('Run a specific agent')
  .action(async (agentName: string) => {
    try {
      logger.info(`Starting agent: ${agentName}`);
      await runAgent(agentName);
      process.exit(0);
    } catch (error: any) {
      logger.error('Agent execution failed:', error);
      process.exit(1);
    }
  });

program
  .command('run-all')
  .description('Run all enabled agents')
  .action(async () => {
    try {
      logger.info('Starting all enabled agents...');
      await runAllAgents();
      process.exit(0);
    } catch (error: any) {
      logger.error('Agent execution failed:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all available agents')
  .action(() => {
    try {
      const config = configLoader.loadAgentsConfig();
      const agents = listAgents();

      console.log('\n📋 Available Agents:\n');

      agents.forEach((agentName) => {
        const enabled = isAgentEnabled(agentName);
        const status = enabled ? '✅ Enabled' : '❌ Disabled';
        const agentConfig = (config.agents as any)[agentName];
        const schedule = agentConfig?.schedule || 'N/A';

        console.log(`  ${agentName}`);
        console.log(`    Status: ${status}`);
        console.log(`    Schedule: ${schedule}`);
        console.log(`    Output: ${agentConfig?.outputPath || 'N/A'}`);
        console.log('');
      });

      process.exit(0);
    } catch (error: any) {
      logger.error('Failed to list agents:', error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    try {
      const config = configLoader.loadAgentsConfig();

      console.log('\n⚙️  Global Settings:\n');
      console.log(`  Content Path: ${config.globalSettings.contentPath}`);
      console.log(`  AI Models: ${Object.keys(config.globalSettings.aiModels).join(', ')}`);
      console.log(`  Fallback Chain: ${config.globalSettings.fallbackChain.join(' → ')}`);
      console.log(`  Daily Budget: $${config.globalSettings.budget.dailyLimit}`);
      console.log(`  Monthly Budget: $${config.globalSettings.budget.monthlyLimit}`);

      process.exit(0);
    } catch (error: any) {
      logger.error('Failed to load config:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
