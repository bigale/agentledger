/**
 * Character-Driven Intelligence System
 *
 * Implements the 5 Danganronpa personalities that influence SUIL processing:
 * - Kyoko Kirigiri: Analytical, logical, detective-like
 * - Chihiro Fujisaki: Technical, programming-focused, optimization-driven
 * - Byakuya Togami: Strategic, enterprise-focused, business-oriented
 * - Toko Fukawa: Creative, writing-focused, artistic
 * - Makoto Naegi: Balanced, hope-driven, reliable
 */
import { Task, TaskResult, ProcessingRoute, CharacterPersonality } from '../core/engine';
export interface PersonalityProfile {
    id: CharacterPersonality;
    name: string;
    traits: string[];
    strengths: string[];
    preferences: PersonalityPreferences;
    decisionMaking: DecisionMakingStyle;
    optimizations: OptimizationStrategy;
    communication: CommunicationStyle;
}
export interface PersonalityPreferences {
    processingRoute: {
        [key in ProcessingRoute]: number;
    };
    taskTypes: {
        [key: string]: number;
    };
    riskTolerance: number;
    speedVsAccuracy: number;
    collaborationStyle: 'independent' | 'collaborative' | 'leadership' | 'supportive';
}
export interface DecisionMakingStyle {
    analyticalWeight: number;
    intuitiveWeight: number;
    riskAssessment: 'conservative' | 'moderate' | 'aggressive';
    fallbackStrategy: 'escalate' | 'retry' | 'alternative' | 'ask_human';
}
export interface OptimizationStrategy {
    cacheStrategy: 'aggressive' | 'conservative' | 'adaptive' | 'creative';
    parallelization: 'maximum' | 'balanced' | 'minimal' | 'situational';
    resourceAllocation: 'efficient' | 'robust' | 'flexible' | 'experimental';
    errorHandling: 'strict' | 'tolerant' | 'adaptive' | 'creative';
}
export interface CommunicationStyle {
    verbosity: 'minimal' | 'concise' | 'detailed' | 'comprehensive';
    tone: 'formal' | 'friendly' | 'technical' | 'creative' | 'supportive';
    explanationDepth: 'basic' | 'intermediate' | 'advanced' | 'expert';
    feedbackStyle: 'direct' | 'constructive' | 'encouraging' | 'analytical';
}
export declare const PERSONALITY_PROFILES: {
    [key in CharacterPersonality]: PersonalityProfile;
};
export declare class PersonalityEngine {
    private currentPersonality;
    private personalityHistory;
    constructor(defaultPersonality?: CharacterPersonality);
    setPersonality(personality: CharacterPersonality): void;
    getCurrentPersonality(): CharacterPersonality;
    getPersonalityProfile(personality?: CharacterPersonality): PersonalityProfile;
    /**
     * Apply personality influence to a task
     */
    influenceTask(task: Task): Task;
    /**
     * Determine preferred processing route based on personality
     */
    selectProcessingRoute(task: Task): ProcessingRoute;
    /**
     * Apply personality-specific optimizations to input
     */
    optimizeInput(input: any, task: Task): any;
    /**
     * Generate personality-influenced response formatting
     */
    formatResponse(result: TaskResult): TaskResult;
    /**
     * Character-specific optimization methods
     */
    private applyKyokoOptimizations;
    private applyChihiroOptimizations;
    private applyByakuyaOptimizations;
    private applyTokoOptimizations;
    private applyMakotoOptimizations;
    private adjustTaskPriority;
    private applyCharacterFormatting;
    /**
     * Record personality usage for analysis
     */
    recordPersonalityUsage(task: Task, result: TaskResult): void;
    /**
     * Get personality usage statistics
     */
    getPersonalityStats(): any;
}
export declare const personalityEngine: PersonalityEngine;
//# sourceMappingURL=personality-engine.d.ts.map