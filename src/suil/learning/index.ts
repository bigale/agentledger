/**
 * SUIL Learning System Exports
 * 
 * Central export point for all SUIL pattern learning components.
 * Provides adaptive intelligence optimization capabilities.
 */

export { 
  PatternLearningSystem,
  createPatternLearningSystem,
  TaskPattern,
  LearningMetrics,
  PatternPrediction
} from './pattern-learning-system';

export { 
  PatternLearningDemo,
  runPatternLearningDemo
} from './pattern-learning-demo';

// Re-export core types for convenience
export {
  Task,
  TaskResult,
  TaskType,
  TaskPriority,
  CharacterPersonality,
  ProcessingRoute
} from '../core/engine';