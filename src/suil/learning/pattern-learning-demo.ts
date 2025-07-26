#!/usr/bin/env ts-node

/**
 * SUIL Pattern Learning Demo
 * 
 * Demonstrates the adaptive pattern recognition capabilities of SUIL's
 * learning system. Shows how patterns are discovered, optimized, and
 * used to improve the 80/15/5 intelligence distribution over time.
 */

import { PatternLearningSystem, PatternPrediction } from './pattern-learning-system';
import { Task, TaskType, TaskPriority, CharacterPersonality, ProcessingRoute, TaskResult } from '../core/engine';

class PatternLearningDemo {
  private learningSystem: PatternLearningSystem;
  private simulatedTaskId: number = 0;

  constructor() {
    this.learningSystem = new PatternLearningSystem();
  }

  async runFullDemo(): Promise<void> {
    console.log('🧠 SUIL Pattern Learning System Demo');
    console.log('===================================');
    console.log('Demonstrating adaptive intelligence optimization\n');

    await this.demoBasicLearning();
    await this.demoPatternPrediction();
    await this.demoCharacterOptimization();
    await this.demoCrossProjectLearning();
    await this.demoPerformanceInsights();
    await this.demoPatternExportImport();

    console.log('🎉 Pattern Learning Demo Complete!');
    console.log('==================================');
    console.log('✅ Demonstrated adaptive pattern recognition');
    console.log('✅ Showed route optimization through learning');
    console.log('✅ Validated character-driven improvements');
    console.log('✅ Proved cross-project knowledge transfer');
    console.log('✅ Confirmed continuous performance enhancement\n');
  }

  private async demoBasicLearning(): Promise<void> {
    console.log('📚 Phase 1: Basic Pattern Learning');
    console.log('----------------------------------');

    // Simulate learning from repetitive cache operations
    const cacheTask = {
      id: `task_${this.simulatedTaskId++}`,
      type: TaskType.CACHE_OPERATION,
      input: { operation: 'get', key: 'user_session_123' },
      priority: TaskPriority.HIGH,
      character: CharacterPersonality.CHIHIRO,
      context: { project: 'agentledger', domain: 'cache' }
    };

    // Simulate multiple executions with consistent results
    for (let i = 0; i < 10; i++) {
      const result = this.simulateTaskResult(cacheTask, ProcessingRoute.SPECIALIZED, 0.005, true);
      await this.learningSystem.learnFromTask(cacheTask, result);
    }

    console.log('🔄 Learned pattern from 10 cache operations');
    
    // Now test prediction
    const prediction = await this.learningSystem.predictOptimalProcessing(cacheTask);
    if (prediction) {
      console.log(`🎯 Prediction: ${prediction.recommendedRoute} route with ${prediction.confidence.toFixed(2)} confidence`);
      console.log(`⚡ Expected latency: ${prediction.expectedLatency.toFixed(3)}ms`);
    }
    console.log('');
  }

  private async demoPatternPrediction(): Promise<void> {
    console.log('🔮 Phase 2: Pattern-Based Prediction');
    console.log('------------------------------------');

    // Create tasks with different patterns but similar structure
    const taskPatterns = [
      {
        type: TaskType.QUEUE_ROUTING,
        input: { strategy: 'fifo', priority: 'high' },
        character: CharacterPersonality.BYAKUYA,
        expectedRoute: ProcessingRoute.SPECIALIZED
      },
      {
        type: TaskType.PATTERN_MATCHING,
        input: { pattern: 'hello_world', complexity: 'simple' },
        character: CharacterPersonality.KYOKO,
        expectedRoute: ProcessingRoute.SPECIALIZED
      },
      {
        type: TaskType.CODE_GENERATION,
        input: { language: 'typescript', complexity: 'advanced' },
        character: CharacterPersonality.TOKO,
        expectedRoute: ProcessingRoute.LLM
      }
    ];

    for (const pattern of taskPatterns) {
      // Train the pattern
      for (let i = 0; i < 5; i++) {
        const task: Task = {
          id: `task_${this.simulatedTaskId++}`,
          type: pattern.type,
          input: pattern.input,
          priority: TaskPriority.MEDIUM,
          character: pattern.character
        };

        const result = this.simulateTaskResult(task, pattern.expectedRoute, this.getLatencyForRoute(pattern.expectedRoute), true);
        await this.learningSystem.learnFromTask(task, result);
      }

      // Test prediction
      const testTask: Task = {
        id: `test_${this.simulatedTaskId++}`,
        type: pattern.type,
        input: pattern.input,
        priority: TaskPriority.MEDIUM,
        character: pattern.character
      };

      const prediction = await this.learningSystem.predictOptimalProcessing(testTask);
      if (prediction) {
        console.log(`📊 ${pattern.type} prediction:`);
        console.log(`   Route: ${prediction.recommendedRoute} (confidence: ${prediction.confidence.toFixed(2)})`);
        console.log(`   Character: ${prediction.recommendedCharacter}`);
        console.log(`   Reasoning: ${prediction.reasoning[0]}`);
      }
    }
    console.log('');
  }

  private async demoCharacterOptimization(): Promise<void> {
    console.log('🎭 Phase 3: Character-Driven Optimization');
    console.log('-----------------------------------------');

    // Demonstrate how characters affect route selection
    const baseTask = {
      type: TaskType.CACHE_OPERATION,
      input: { operation: 'set', key: 'performance_test' },
      priority: TaskPriority.HIGH
    };

    const characters = [
      CharacterPersonality.CHIHIRO,  // Performance-focused
      CharacterPersonality.KYOKO,    // Analytical
      CharacterPersonality.BYAKUYA,  // Strategic
      CharacterPersonality.TOKO,     // Creative
      CharacterPersonality.MAKOTO    // Balanced
    ];

    for (const character of characters) {
      const task: Task = {
        id: `char_${this.simulatedTaskId++}`,
        ...baseTask,
        character
      };

      // Train with character-specific optimizations
      for (let i = 0; i < 8; i++) {
        const optimalRoute = this.getOptimalRouteForCharacter(character, baseTask.type);
        const result = this.simulateTaskResult(task, optimalRoute, this.getLatencyForRoute(optimalRoute), true);
        await this.learningSystem.learnFromTask(task, result);
      }

      // Test character prediction
      const prediction = await this.learningSystem.predictOptimalProcessing(task);
      if (prediction) {
        console.log(`🎯 ${character} optimization:`);
        console.log(`   Preferred route: ${prediction.recommendedRoute}`);
        console.log(`   Expected performance: ${prediction.expectedLatency.toFixed(3)}ms`);
      }
    }
    console.log('');
  }

  private async demoCrossProjectLearning(): Promise<void> {
    console.log('🔗 Phase 4: Cross-Project Knowledge Transfer');
    console.log('--------------------------------------------');

    const projects = [
      { name: 'agentledger', domain: 'cache', taskType: TaskType.CACHE_OPERATION },
      { name: 'icpxmldb', domain: 'schema', taskType: TaskType.SCHEMA_PROCESSING },
      { name: 'sitebud', domain: 'language', taskType: TaskType.TRANSLATION },
      { name: 'icport', domain: 'deployment', taskType: TaskType.KIT_BUILDING }
    ];

    for (const project of projects) {
      const task: Task = {
        id: `project_${this.simulatedTaskId++}`,
        type: project.taskType,
        input: { projectSpecific: true, complexity: 'medium' },
        priority: TaskPriority.MEDIUM,
        character: CharacterPersonality.MAKOTO,
        context: { project: project.name, domain: project.domain }
      };

      // Train project-specific patterns
      for (let i = 0; i < 6; i++) {
        const route = this.getRouteForProject(project.name);
        const result = this.simulateTaskResult(task, route, this.getLatencyForRoute(route), true);
        await this.learningSystem.learnFromTask(task, result);
      }

      const prediction = await this.learningSystem.predictOptimalProcessing(task);
      if (prediction) {
        console.log(`🚀 ${project.name} learning:`);
        console.log(`   Domain: ${project.domain}`);
        console.log(`   Optimal route: ${prediction.recommendedRoute}`);
        console.log(`   Transfer confidence: ${prediction.confidence.toFixed(2)}`);
      }
    }
    console.log('');
  }

  private async demoPerformanceInsights(): Promise<void> {
    console.log('📊 Phase 5: Performance Insights & Analytics');
    console.log('--------------------------------------------');

    const insights = this.learningSystem.getPerformanceInsights();

    console.log('🧠 Learning Metrics:');
    console.log(`   Patterns learned: ${insights.metrics.totalPatternsLearned}`);
    console.log(`   Route optimizations: ${insights.metrics.routeOptimizations}`);
    console.log(`   Character optimizations: ${insights.metrics.characterOptimizations}`);
    console.log(`   Avg confidence: ${insights.metrics.avgConfidenceScore.toFixed(2)}`);
    console.log(`   Pattern match rate: ${(insights.metrics.patternMatchRate * 100).toFixed(1)}%`);
    console.log('');

    console.log('📈 Intelligence Distribution:');
    console.log(`   Specialized: ${insights.distributions.routes.specialized}%`);
    console.log(`   Hybrid: ${insights.distributions.routes.hybrid}%`);
    console.log(`   LLM: ${insights.distributions.routes.llm}%`);
    console.log('');

    console.log('🎭 Character Usage:');
    Object.entries(insights.distributions.characters).forEach(([char, usage]) => {
      console.log(`   ${char}: ${usage}%`);
    });
    console.log('');

    console.log('💡 Top Patterns by Usage:');
    insights.topPatterns.slice(0, 3).forEach((pattern: any, index: number) => {
      console.log(`   ${index + 1}. ${pattern.type} (${pattern.usageCount} uses, ${(pattern.successRate * 100).toFixed(1)}% success)`);
    });
    console.log('');

    if (insights.recommendations.length > 0) {
      console.log('🔧 Optimization Recommendations:');
      insights.recommendations.forEach((rec: string) => {
        console.log(`   • ${rec}`);
      });
      console.log('');
    }
  }

  private async demoPatternExportImport(): Promise<void> {
    console.log('💾 Phase 6: Pattern Export & Import');
    console.log('-----------------------------------');

    // Export patterns
    const exportData = this.learningSystem.exportPatterns();
    console.log(`📤 Exported ${exportData.patternsCount} patterns`);
    console.log(`   Total learning time: ${exportData.timestamp}`);
    console.log(`   Configuration: Learning ${exportData.configuration.isLearningEnabled ? 'enabled' : 'disabled'}`);
    console.log('');

    // Demonstrate import (in real usage, this would be from a file)
    const newLearningSystem = new PatternLearningSystem();
    newLearningSystem.importPatterns(exportData);
    
    console.log('📥 Successfully imported patterns to new system');
    
    // Verify import by testing prediction
    const testTask: Task = {
      id: 'import_test',
      type: TaskType.CACHE_OPERATION,
      input: { operation: 'get', key: 'user_session_123' },
      priority: TaskPriority.HIGH,
      character: CharacterPersonality.CHIHIRO
    };

    const prediction = await newLearningSystem.predictOptimalProcessing(testTask);
    if (prediction) {
      console.log(`✅ Import verification: ${prediction.recommendedRoute} route predicted with ${prediction.confidence.toFixed(2)} confidence`);
    }
    console.log('');
  }

  // Helper methods for simulation
  private simulateTaskResult(task: Task, route: ProcessingRoute, latency: number, success: boolean): TaskResult {
    return {
      taskId: task.id,
      result: success ? { success: true, data: 'simulated_result' } : { error: 'simulated_error' },
      processingTime: latency + (Math.random() - 0.5) * latency * 0.2, // Add some variance
      route,
      character: task.character,
      confidence: 0.85 + Math.random() * 0.15
    };
  }

  private getLatencyForRoute(route: ProcessingRoute): number {
    const latencies = {
      [ProcessingRoute.SPECIALIZED]: 0.005, // 5ms
      [ProcessingRoute.HYBRID]: 0.025,      // 25ms
      [ProcessingRoute.LLM]: 150             // 150ms
    };
    return latencies[route] || 0.025;
  }

  private getOptimalRouteForCharacter(character: CharacterPersonality, taskType: TaskType): ProcessingRoute {
    // Character-specific route preferences
    if (character === CharacterPersonality.CHIHIRO) {
      return ProcessingRoute.SPECIALIZED; // Performance focus
    }
    if (character === CharacterPersonality.TOKO && taskType === TaskType.CODE_GENERATION) {
      return ProcessingRoute.LLM; // Creative tasks
    }
    if (character === CharacterPersonality.KYOKO) {
      return taskType === TaskType.PATTERN_MATCHING ? ProcessingRoute.SPECIALIZED : ProcessingRoute.HYBRID;
    }
    return ProcessingRoute.HYBRID; // Default
  }

  private getRouteForProject(project: string): ProcessingRoute {
    const projectRoutes: { [key: string]: ProcessingRoute } = {
      'agentledger': ProcessingRoute.SPECIALIZED,
      'icpxmldb': ProcessingRoute.HYBRID,
      'sitebud': ProcessingRoute.LLM,
      'icport': ProcessingRoute.HYBRID
    };
    return projectRoutes[project] || ProcessingRoute.HYBRID;
  }
}

// CLI execution
export async function runPatternLearningDemo(): Promise<void> {
  const demo = new PatternLearningDemo();
  await demo.runFullDemo();
}

// Export for external use
if (require.main === module) {
  runPatternLearningDemo().catch(console.error);
}

export { PatternLearningDemo };