/**
 * SUIL Pattern Learning System
 * 
 * Adaptive pattern recognition that learns from task execution to continuously
 * improve the 80/15/5 intelligence distribution. Uses machine learning techniques
 * to optimize route selection, character assignment, and performance.
 * 
 * Key Features:
 * - Task pattern analysis and categorization
 * - Adaptive route optimization based on historical performance
 * - Character personality learning and refinement
 * - Cross-project pattern discovery and knowledge transfer
 * - Performance prediction and optimization recommendations
 */

import { Task, TaskResult, TaskType, CharacterPersonality, ProcessingRoute } from '../core/engine';
import { personalityEngine } from '../characters/personality-engine';

export interface TaskPattern {
  id: string;
  type: TaskType;
  inputSignature: string;
  contextFeatures: string[];
  optimalRoute: ProcessingRoute;
  optimalCharacter: CharacterPersonality;
  avgLatency: number;
  successRate: number;
  confidence: number;
  usageCount: number;
  lastUsed: Date;
}

export interface LearningMetrics {
  totalPatternsLearned: number;
  routeOptimizations: number;
  characterOptimizations: number;
  avgConfidenceScore: number;
  patternMatchRate: number;
  performanceImprovement: number;
}

export interface PatternPrediction {
  pattern: TaskPattern;
  confidence: number;
  recommendedRoute: ProcessingRoute;
  recommendedCharacter: CharacterPersonality;
  expectedLatency: number;
  reasoning: string[];
}

export class PatternLearningSystem {
  private patterns: Map<string, TaskPattern> = new Map();
  private taskHistory: TaskResult[] = [];
  private learningMetrics: LearningMetrics;
  private isLearningEnabled: boolean = true;
  private minPatternConfidence: number = 0.75;
  private maxPatternsToTrack: number = 10000;

  constructor() {
    this.learningMetrics = {
      totalPatternsLearned: 0,
      routeOptimizations: 0,
      characterOptimizations: 0,
      avgConfidenceScore: 0,
      patternMatchRate: 0,
      performanceImprovement: 0
    };

    this.initializeLearningSystem();
  }

  private initializeLearningSystem(): void {
    console.log('🧠 Initializing SUIL Pattern Learning System');
    console.log('==========================================');
    console.log('📊 Features: Adaptive routing, character optimization, cross-project learning');
    console.log('🎯 Goal: Continuous improvement of 80/15/5 intelligence distribution');
    console.log('');
  }

  /**
   * Learn from a completed task execution
   */
  async learnFromTask(task: Task, result: TaskResult): Promise<void> {
    if (!this.isLearningEnabled) return;

    // Add to history
    this.taskHistory.push(result);
    
    // Maintain history size
    if (this.taskHistory.length > 50000) {
      this.taskHistory = this.taskHistory.slice(-25000);
    }

    // Extract pattern signature
    const patternId = this.generatePatternId(task);
    const inputSignature = this.generateInputSignature(task.input);
    const contextFeatures = this.extractContextFeatures(task);

    // Update or create pattern
    const existingPattern = this.patterns.get(patternId);
    
    if (existingPattern) {
      await this.updateExistingPattern(existingPattern, task, result);
    } else {
      await this.createNewPattern(patternId, task, result, inputSignature, contextFeatures);
    }

    // Update learning metrics
    this.updateLearningMetrics();

    // Periodic optimization
    if (this.taskHistory.length % 1000 === 0) {
      await this.optimizePatterns();
    }
  }

  /**
   * Predict optimal processing for a new task
   */
  async predictOptimalProcessing(task: Task): Promise<PatternPrediction | null> {
    const patternId = this.generatePatternId(task);
    const inputSignature = this.generateInputSignature(task.input);
    
    // Look for exact pattern match
    const exactMatch = this.patterns.get(patternId);
    if (exactMatch && exactMatch.confidence >= this.minPatternConfidence) {
      return this.buildPrediction(exactMatch, 'exact_match');
    }

    // Look for similar patterns
    const similarPattern = await this.findSimilarPattern(task, inputSignature);
    if (similarPattern && similarPattern.confidence >= this.minPatternConfidence - 0.1) {
      return this.buildPrediction(similarPattern, 'similar_pattern');
    }

    // Use character-based prediction
    const characterPrediction = await this.predictByCharacter(task);
    if (characterPrediction) {
      return characterPrediction;
    }

    return null;
  }

  /**
   * Get performance insights and recommendations
   */
  getPerformanceInsights(): any {
    const topPatterns = Array.from(this.patterns.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    const routeDistribution = this.calculateRouteDistribution();
    const characterDistribution = this.calculateCharacterDistribution();

    return {
      metrics: this.learningMetrics,
      topPatterns: topPatterns.map(p => ({
        type: p.type,
        avgLatency: p.avgLatency,
        successRate: p.successRate,
        usageCount: p.usageCount,
        confidence: p.confidence
      })),
      distributions: {
        routes: routeDistribution,
        characters: characterDistribution
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Export learned patterns for analysis or backup
   */
  exportPatterns(): any {
    return {
      timestamp: new Date().toISOString(),
      patternsCount: this.patterns.size,
      patterns: Array.from(this.patterns.entries()).map(([id, pattern]) => ({
        id,
        ...pattern,
        lastUsed: pattern.lastUsed.toISOString()
      })),
      metrics: this.learningMetrics,
      configuration: {
        isLearningEnabled: this.isLearningEnabled,
        minPatternConfidence: this.minPatternConfidence,
        maxPatternsToTrack: this.maxPatternsToTrack
      }
    };
  }

  /**
   * Import patterns from previous learning sessions
   */
  importPatterns(data: any): void {
    console.log(`🔄 Importing ${data.patternsCount} learned patterns`);
    
    this.patterns.clear();
    
    data.patterns.forEach((patternData: any) => {
      const pattern: TaskPattern = {
        ...patternData,
        lastUsed: new Date(patternData.lastUsed)
      };
      this.patterns.set(patternData.id, pattern);
    });

    this.learningMetrics = data.metrics || this.learningMetrics;
    
    console.log(`✅ Successfully imported ${this.patterns.size} patterns`);
  }

  /**
   * Advanced pattern analysis and optimization
   */
  async optimizePatterns(): Promise<void> {
    console.log('🔍 Running pattern optimization analysis...');
    
    // Remove low-confidence or unused patterns
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const patternsToRemove = [];
    
    for (const [id, pattern] of this.patterns.entries()) {
      if (pattern.confidence < 0.3 || 
          pattern.usageCount < 5 ||
          pattern.lastUsed < cutoffDate) {
        patternsToRemove.push(id);
      }
    }
    
    patternsToRemove.forEach(id => this.patterns.delete(id));
    
    // Merge similar patterns
    await this.mergeSimilarPatterns();
    
    // Update route optimization recommendations
    await this.updateRouteOptimizations();
    
    console.log(`🧹 Pattern optimization complete: ${patternsToRemove.length} patterns removed`);
  }

  // Private helper methods
  private generatePatternId(task: Task): string {
    const contextHash = this.hashContext(task.context || {});
    return `${task.type}_${task.character || 'none'}_${contextHash}`;
  }

  private generateInputSignature(input: any): string {
    if (typeof input !== 'object') return String(input);
    
    const keys = Object.keys(input).sort();
    const signature = keys.map(key => {
      const value = input[key];
      if (typeof value === 'string') {
        return `${key}:str[${Math.min(value.length, 50)}]`;
      } else if (typeof value === 'number') {
        return `${key}:num`;
      } else if (Array.isArray(value)) {
        return `${key}:arr[${value.length}]`;
      } else {
        return `${key}:obj`;
      }
    }).join(',');
    
    return signature;
  }

  private extractContextFeatures(task: Task): string[] {
    const features = [];
    
    if (task.context) {
      if (task.context.project) features.push(`project:${task.context.project}`);
      if (task.context.domain) features.push(`domain:${task.context.domain}`);
      if (task.context.priority) features.push(`priority:${task.context.priority}`);
    }
    
    if (task.priority) features.push(`task_priority:${task.priority}`);
    if (task.character) features.push(`character:${task.character}`);
    
    return features;
  }

  private hashContext(context: any): string {
    const str = JSON.stringify(context, Object.keys(context).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async updateExistingPattern(
    pattern: TaskPattern, 
    task: Task, 
    result: TaskResult
  ): Promise<void> {
    pattern.usageCount++;
    pattern.lastUsed = new Date();
    
    // Update performance metrics with exponential moving average
    const alpha = 0.1; // Learning rate
    pattern.avgLatency = pattern.avgLatency * (1 - alpha) + (result.processingTime || 0) * alpha;
    
    // Update success rate
    const isSuccess = !result.result?.error;
    pattern.successRate = pattern.successRate * (1 - alpha) + (isSuccess ? 1 : 0) * alpha;
    
    // Update confidence based on consistency
    const routeMatches = result.route === pattern.optimalRoute;
    const characterMatches = task.character === pattern.optimalCharacter;
    
    if (routeMatches && characterMatches && isSuccess) {
      pattern.confidence = Math.min(1, pattern.confidence + 0.05);
    } else if (!routeMatches || !characterMatches) {
      pattern.confidence = Math.max(0.1, pattern.confidence - 0.02);
      
      // Adapt to better route/character if consistently performing better
      if (isSuccess && (result.processingTime || 0) < pattern.avgLatency) {
        pattern.optimalRoute = result.route;
        pattern.optimalCharacter = task.character || pattern.optimalCharacter;
        this.learningMetrics.routeOptimizations++;
      }
    }
  }

  private async createNewPattern(
    patternId: string,
    task: Task,
    result: TaskResult,
    inputSignature: string,
    contextFeatures: string[]
  ): Promise<void> {
    const newPattern: TaskPattern = {
      id: patternId,
      type: task.type,
      inputSignature,
      contextFeatures,
      optimalRoute: result.route,
      optimalCharacter: task.character || CharacterPersonality.MAKOTO,
      avgLatency: result.processingTime || 0,
      successRate: result.result?.error ? 0 : 1,
      confidence: 0.5, // Start with medium confidence
      usageCount: 1,
      lastUsed: new Date()
    };
    
    // Check if we're at capacity
    if (this.patterns.size >= this.maxPatternsToTrack) {
      // Remove least used pattern
      const leastUsed = Array.from(this.patterns.entries())
        .sort((a, b) => a[1].usageCount - b[1].usageCount)[0];
      this.patterns.delete(leastUsed[0]);
    }
    
    this.patterns.set(patternId, newPattern);
    this.learningMetrics.totalPatternsLearned++;
  }

  private async findSimilarPattern(task: Task, inputSignature: string): Promise<TaskPattern | null> {
    let bestMatch: TaskPattern | null = null;
    let bestSimilarity = 0;
    
    for (const pattern of this.patterns.values()) {
      if (pattern.type !== task.type) continue;
      
      // Calculate similarity
      const similarity = this.calculateSimilarity(pattern, task, inputSignature);
      
      if (similarity > bestSimilarity && similarity > 0.7) {
        bestSimilarity = similarity;
        bestMatch = pattern;
      }
    }
    
    return bestMatch;
  }

  private calculateSimilarity(pattern: TaskPattern, task: Task, inputSignature: string): number {
    let similarity = 0;
    let factors = 0;
    
    // Input signature similarity
    const inputSim = this.stringSimilarity(pattern.inputSignature, inputSignature);
    similarity += inputSim * 0.4;
    factors += 0.4;
    
    // Context features similarity
    const taskFeatures = this.extractContextFeatures(task);
    const contextSim = this.arrayIntersection(pattern.contextFeatures, taskFeatures).length / 
                      Math.max(pattern.contextFeatures.length, taskFeatures.length);
    similarity += contextSim * 0.3;
    factors += 0.3;
    
    // Character match
    if (pattern.optimalCharacter === task.character) {
      similarity += 0.3;
    }
    factors += 0.3;
    
    return factors > 0 ? similarity / factors : 0;
  }

  private async predictByCharacter(task: Task): Promise<PatternPrediction | null> {
    if (!task.character) return null;
    
    const characterPatterns = Array.from(this.patterns.values())
      .filter(p => p.optimalCharacter === task.character && p.type === task.type)
      .sort((a, b) => b.confidence - a.confidence);
    
    if (characterPatterns.length === 0) return null;
    
    const bestPattern = characterPatterns[0];
    
    return {
      pattern: bestPattern,
      confidence: bestPattern.confidence * 0.8, // Reduce confidence for character-based prediction
      recommendedRoute: bestPattern.optimalRoute,
      recommendedCharacter: bestPattern.optimalCharacter,
      expectedLatency: bestPattern.avgLatency,
      reasoning: [
        `Character-based prediction using ${task.character}`,
        `Based on ${characterPatterns.length} similar patterns`,
        `Average confidence: ${bestPattern.confidence.toFixed(2)}`
      ]
    };
  }

  private buildPrediction(pattern: TaskPattern, matchType: string): PatternPrediction {
    return {
      pattern,
      confidence: pattern.confidence,
      recommendedRoute: pattern.optimalRoute,
      recommendedCharacter: pattern.optimalCharacter,
      expectedLatency: pattern.avgLatency,
      reasoning: [
        `${matchType} with confidence ${pattern.confidence.toFixed(2)}`,
        `Based on ${pattern.usageCount} previous executions`,
        `Success rate: ${(pattern.successRate * 100).toFixed(1)}%`,
        `Last used: ${pattern.lastUsed.toLocaleDateString()}`
      ]
    };
  }

  private calculateRouteDistribution(): any {
    const routeCounts = { specialized: 0, hybrid: 0, llm: 0 };
    
    for (const pattern of this.patterns.values()) {
      routeCounts[pattern.optimalRoute] = (routeCounts[pattern.optimalRoute] || 0) + pattern.usageCount;
    }
    
    const total = Object.values(routeCounts).reduce((sum, count) => sum + count, 0);
    
    return {
      specialized: Math.round((routeCounts.specialized / total) * 100) || 0,
      hybrid: Math.round((routeCounts.hybrid / total) * 100) || 0,
      llm: Math.round((routeCounts.llm / total) * 100) || 0
    };
  }

  private calculateCharacterDistribution(): any {
    const characterCounts: { [key: string]: number } = {};
    
    for (const pattern of this.patterns.values()) {
      const char = pattern.optimalCharacter;
      characterCounts[char] = (characterCounts[char] || 0) + pattern.usageCount;
    }
    
    const total = Object.values(characterCounts).reduce((sum, count) => sum + count, 0);
    const distribution: { [key: string]: number } = {};
    
    for (const [char, count] of Object.entries(characterCounts)) {
      distribution[char] = Math.round((count / total) * 100) || 0;
    }
    
    return distribution;
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const insights = this.getPerformanceInsights();
    
    // Route distribution recommendations
    const routeDist = insights.distributions.routes;
    if (routeDist.specialized < 70) {
      recommendations.push('Consider optimizing more tasks for specialized processing');
    }
    if (routeDist.llm > 10) {
      recommendations.push('High LLM usage detected - review pattern recognition accuracy');
    }
    
    // Performance recommendations
    if (this.learningMetrics.avgConfidenceScore < 0.7) {
      recommendations.push('Pattern confidence is low - increase learning period');
    }
    
    if (this.learningMetrics.patternMatchRate < 0.6) {
      recommendations.push('Low pattern match rate - consider expanding pattern features');
    }
    
    return recommendations;
  }

  private async mergeSimilarPatterns(): Promise<void> {
    // Implementation for merging similar patterns to reduce duplication
    const patterns = Array.from(this.patterns.entries());
    const toMerge: [string, string][] = [];
    
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const [id1, pattern1] = patterns[i];
        const [id2, pattern2] = patterns[j];
        
        if (pattern1.type === pattern2.type) {
          const similarity = this.stringSimilarity(pattern1.inputSignature, pattern2.inputSignature);
          if (similarity > 0.9) {
            toMerge.push([id1, id2]);
          }
        }
      }
    }
    
    // Merge similar patterns (keep the one with higher usage)
    for (const [id1, id2] of toMerge) {
      const pattern1 = this.patterns.get(id1);
      const pattern2 = this.patterns.get(id2);
      
      if (pattern1 && pattern2) {
        if (pattern1.usageCount >= pattern2.usageCount) {
          pattern1.usageCount += pattern2.usageCount;
          this.patterns.delete(id2);
        } else {
          pattern2.usageCount += pattern1.usageCount;
          this.patterns.delete(id1);
        }
      }
    }
  }

  private async updateRouteOptimizations(): Promise<void> {
    // Analyze recent performance to identify route optimization opportunities
    const recentHistory = this.taskHistory.slice(-1000);
    const routePerformance: { [key: string]: { latency: number; count: number } } = {};
    
    for (const result of recentHistory) {
      const route = result.route;
      if (!routePerformance[route]) {
        routePerformance[route] = { latency: 0, count: 0 };
      }
      routePerformance[route].latency += result.processingTime || 0;
      routePerformance[route].count++;
    }
    
    // Calculate average latencies
    for (const route in routePerformance) {
      const perf = routePerformance[route];
      perf.latency = perf.latency / perf.count;
    }
    
    // Update patterns based on performance analysis
    for (const pattern of this.patterns.values()) {
      const currentRoutePerf = routePerformance[pattern.optimalRoute];
      if (currentRoutePerf && currentRoutePerf.latency > pattern.avgLatency * 1.5) {
        // Consider route optimization
        this.learningMetrics.routeOptimizations++;
      }
    }
  }

  private updateLearningMetrics(): void {
    const patterns = Array.from(this.patterns.values());
    
    this.learningMetrics.avgConfidenceScore = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
      : 0;
    
    // Calculate pattern match rate from recent history
    const recentTasks = this.taskHistory.slice(-100);
    const matchedTasks = recentTasks.filter(result => 
      this.patterns.has(this.generatePatternId(result as any))
    );
    
    this.learningMetrics.patternMatchRate = recentTasks.length > 0 
      ? matchedTasks.length / recentTasks.length 
      : 0;
  }

  // Utility methods
  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private arrayIntersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => arr2.includes(item));
  }
}

// Factory function for easy integration
export function createPatternLearningSystem(): PatternLearningSystem {
  return new PatternLearningSystem();
}

// Export for external use
export { PatternLearningSystem as default };