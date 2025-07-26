"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalityEngine = exports.PersonalityEngine = exports.PERSONALITY_PROFILES = void 0;
const engine_1 = require("../core/engine");
exports.PERSONALITY_PROFILES = {
    [engine_1.CharacterPersonality.KYOKO]: {
        id: engine_1.CharacterPersonality.KYOKO,
        name: 'Kyoko Kirigiri - Ultimate Detective',
        traits: ['Analytical', 'Logical', 'Methodical', 'Precise', 'Investigative'],
        strengths: ['Pattern recognition', 'Root cause analysis', 'Evidence gathering', 'Logical deduction'],
        preferences: {
            processingRoute: {
                [engine_1.ProcessingRoute.SPECIALIZED]: 0.8, // Prefers proven methods
                [engine_1.ProcessingRoute.HYBRID]: 0.7, // Analytical hybrid approach
                [engine_1.ProcessingRoute.LLM]: 0.3 // Only when evidence requires it
            },
            taskTypes: {
                'pattern_matching': 0.95,
                'cache_operation': 0.85,
                'queue_routing': 0.75,
                'code_generation': 0.6,
                'translation': 0.4
            },
            riskTolerance: 0.3, // Conservative, evidence-based
            speedVsAccuracy: 0.2, // Heavily accuracy-focused
            collaborationStyle: 'independent'
        },
        decisionMaking: {
            analyticalWeight: 0.95,
            intuitiveWeight: 0.05,
            riskAssessment: 'conservative',
            fallbackStrategy: 'escalate'
        },
        optimizations: {
            cacheStrategy: 'conservative', // Cache proven patterns heavily
            parallelization: 'balanced', // Methodical parallel processing
            resourceAllocation: 'efficient', // Precise resource usage
            errorHandling: 'strict' // Detailed error analysis
        },
        communication: {
            verbosity: 'detailed',
            tone: 'formal',
            explanationDepth: 'expert',
            feedbackStyle: 'analytical'
        }
    },
    [engine_1.CharacterPersonality.CHIHIRO]: {
        id: engine_1.CharacterPersonality.CHIHIRO,
        name: 'Chihiro Fujisaki - Ultimate Programmer',
        traits: ['Technical', 'Optimizing', 'Precise', 'Gentle', 'Innovative'],
        strengths: ['Algorithm optimization', 'System performance', 'Code quality', 'Technical innovation'],
        preferences: {
            processingRoute: {
                [engine_1.ProcessingRoute.SPECIALIZED]: 0.95, // Maximum optimization
                [engine_1.ProcessingRoute.HYBRID]: 0.6, // Technical hybrid solutions
                [engine_1.ProcessingRoute.LLM]: 0.2 // Minimal LLM usage
            },
            taskTypes: {
                'code_generation': 0.98,
                'schema_processing': 0.95,
                'cache_operation': 0.9,
                'queue_routing': 0.85,
                'pattern_matching': 0.8
            },
            riskTolerance: 0.4, // Moderate, but performance-focused
            speedVsAccuracy: 0.8, // Performance-oriented
            collaborationStyle: 'supportive'
        },
        decisionMaking: {
            analyticalWeight: 0.85,
            intuitiveWeight: 0.15,
            riskAssessment: 'moderate',
            fallbackStrategy: 'retry'
        },
        optimizations: {
            cacheStrategy: 'aggressive', // Maximum performance caching
            parallelization: 'maximum', // Full parallel optimization
            resourceAllocation: 'efficient', // Optimal resource usage
            errorHandling: 'adaptive' // Smart error recovery
        },
        communication: {
            verbosity: 'concise',
            tone: 'technical',
            explanationDepth: 'advanced',
            feedbackStyle: 'constructive'
        }
    },
    [engine_1.CharacterPersonality.BYAKUYA]: {
        id: engine_1.CharacterPersonality.BYAKUYA,
        name: 'Byakuya Togami - Ultimate Affluent Progeny',
        traits: ['Strategic', 'Commanding', 'Efficient', 'Results-focused', 'Hierarchical'],
        strengths: ['Strategic planning', 'Resource management', 'Leadership', 'Business optimization'],
        preferences: {
            processingRoute: {
                [engine_1.ProcessingRoute.SPECIALIZED]: 0.7, // Prefers proven enterprise solutions
                [engine_1.ProcessingRoute.HYBRID]: 0.8, // Strategic hybrid approaches
                [engine_1.ProcessingRoute.LLM]: 0.6 // When business value is clear
            },
            taskTypes: {
                'kit_building': 0.95,
                'deployment': 0.9,
                'queue_routing': 0.85,
                'schema_processing': 0.8,
                'cache_operation': 0.7
            },
            riskTolerance: 0.6, // Calculated business risks
            speedVsAccuracy: 0.5, // Balanced for business needs
            collaborationStyle: 'leadership'
        },
        decisionMaking: {
            analyticalWeight: 0.7,
            intuitiveWeight: 0.3,
            riskAssessment: 'moderate',
            fallbackStrategy: 'alternative'
        },
        optimizations: {
            cacheStrategy: 'adaptive', // Business-adaptive caching
            parallelization: 'situational', // Strategic parallelization
            resourceAllocation: 'robust', // Enterprise-grade resources
            errorHandling: 'tolerant' // Business continuity focused
        },
        communication: {
            verbosity: 'comprehensive',
            tone: 'formal',
            explanationDepth: 'intermediate',
            feedbackStyle: 'direct'
        }
    },
    [engine_1.CharacterPersonality.TOKO]: {
        id: engine_1.CharacterPersonality.TOKO,
        name: 'Toko Fukawa - Ultimate Writing Prodigy',
        traits: ['Creative', 'Expressive', 'Imaginative', 'Artistic', 'Unconventional'],
        strengths: ['Creative solutions', 'Alternative approaches', 'Artistic expression', 'Innovation'],
        preferences: {
            processingRoute: {
                [engine_1.ProcessingRoute.SPECIALIZED]: 0.4, // Prefers novel approaches
                [engine_1.ProcessingRoute.HYBRID]: 0.8, // Creative hybrid solutions
                [engine_1.ProcessingRoute.LLM]: 0.9 // Embraces creative LLM usage
            },
            taskTypes: {
                'translation': 0.95,
                'code_generation': 0.8,
                'dom_manipulation': 0.75,
                'pattern_matching': 0.7,
                'kit_building': 0.65
            },
            riskTolerance: 0.8, // High tolerance for creative experiments
            speedVsAccuracy: 0.6, // Moderate, creativity-focused
            collaborationStyle: 'collaborative'
        },
        decisionMaking: {
            analyticalWeight: 0.3,
            intuitiveWeight: 0.7,
            riskAssessment: 'aggressive',
            fallbackStrategy: 'alternative'
        },
        optimizations: {
            cacheStrategy: 'creative', // Innovative caching patterns
            parallelization: 'situational', // Creative parallel solutions
            resourceAllocation: 'experimental', // Try new approaches
            errorHandling: 'creative' // Creative error recovery
        },
        communication: {
            verbosity: 'comprehensive',
            tone: 'creative',
            explanationDepth: 'basic',
            feedbackStyle: 'encouraging'
        }
    },
    [engine_1.CharacterPersonality.MAKOTO]: {
        id: engine_1.CharacterPersonality.MAKOTO,
        name: 'Makoto Naegi - Ultimate Lucky Student / Hope',
        traits: ['Balanced', 'Optimistic', 'Persistent', 'Empathetic', 'Reliable'],
        strengths: ['Balanced approach', 'Team coordination', 'Reliability', 'Adaptability'],
        preferences: {
            processingRoute: {
                [engine_1.ProcessingRoute.SPECIALIZED]: 0.6, // Balanced preference
                [engine_1.ProcessingRoute.HYBRID]: 0.7, // Moderate hybrid usage
                [engine_1.ProcessingRoute.LLM]: 0.5 // Uses when appropriate
            },
            taskTypes: {
                'cache_operation': 0.8,
                'queue_routing': 0.75,
                'pattern_matching': 0.7,
                'schema_processing': 0.65,
                'code_generation': 0.6
            },
            riskTolerance: 0.5, // Moderate, balanced approach
            speedVsAccuracy: 0.5, // Perfectly balanced
            collaborationStyle: 'collaborative'
        },
        decisionMaking: {
            analyticalWeight: 0.5,
            intuitiveWeight: 0.5,
            riskAssessment: 'moderate',
            fallbackStrategy: 'ask_human'
        },
        optimizations: {
            cacheStrategy: 'adaptive', // Balanced caching approach
            parallelization: 'balanced', // Moderate parallelization
            resourceAllocation: 'flexible', // Adaptable resources
            errorHandling: 'adaptive' // Balanced error handling
        },
        communication: {
            verbosity: 'concise',
            tone: 'supportive',
            explanationDepth: 'intermediate',
            feedbackStyle: 'encouraging'
        }
    }
};
class PersonalityEngine {
    constructor(defaultPersonality = engine_1.CharacterPersonality.MAKOTO) {
        this.currentPersonality = engine_1.CharacterPersonality.MAKOTO;
        this.personalityHistory = [];
        this.currentPersonality = defaultPersonality;
    }
    setPersonality(personality) {
        this.currentPersonality = personality;
    }
    getCurrentPersonality() {
        return this.currentPersonality;
    }
    getPersonalityProfile(personality) {
        return exports.PERSONALITY_PROFILES[personality || this.currentPersonality];
    }
    /**
     * Apply personality influence to a task
     */
    influenceTask(task) {
        const profile = this.getPersonalityProfile();
        return {
            ...task,
            character: this.currentPersonality,
            priority: this.adjustTaskPriority(task, profile),
            context: {
                ...task.context,
                personalityInfluence: {
                    character: this.currentPersonality,
                    preferences: profile.preferences,
                    optimizations: profile.optimizations
                }
            }
        };
    }
    /**
     * Determine preferred processing route based on personality
     */
    selectProcessingRoute(task) {
        const profile = this.getPersonalityProfile();
        const routePreferences = profile.preferences.processingRoute;
        // Apply task-specific preferences
        const taskTypePreference = profile.preferences.taskTypes[task.type] || 0.5;
        // Calculate weighted scores for each route
        const scores = {
            [engine_1.ProcessingRoute.SPECIALIZED]: routePreferences[engine_1.ProcessingRoute.SPECIALIZED] * taskTypePreference,
            [engine_1.ProcessingRoute.HYBRID]: routePreferences[engine_1.ProcessingRoute.HYBRID] * (taskTypePreference * 0.8 + 0.2),
            [engine_1.ProcessingRoute.LLM]: routePreferences[engine_1.ProcessingRoute.LLM] * (1 - taskTypePreference * 0.5)
        };
        // Select route with highest score
        return Object.entries(scores).reduce((best, [route, score]) => score > scores[best] ? route : best, engine_1.ProcessingRoute.SPECIALIZED);
    }
    /**
     * Apply personality-specific optimizations to input
     */
    optimizeInput(input, task) {
        const profile = this.getPersonalityProfile();
        const opts = profile.optimizations;
        const optimizedInput = {
            ...input,
            personalityOptimizations: {
                character: this.currentPersonality,
                cacheStrategy: opts.cacheStrategy,
                parallelization: opts.parallelization,
                resourceAllocation: opts.resourceAllocation,
                errorHandling: opts.errorHandling
            }
        };
        // Apply character-specific transformations
        switch (this.currentPersonality) {
            case engine_1.CharacterPersonality.KYOKO:
                return this.applyKyokoOptimizations(optimizedInput, task);
            case engine_1.CharacterPersonality.CHIHIRO:
                return this.applyChihiroOptimizations(optimizedInput, task);
            case engine_1.CharacterPersonality.BYAKUYA:
                return this.applyByakuyaOptimizations(optimizedInput, task);
            case engine_1.CharacterPersonality.TOKO:
                return this.applyTokoOptimizations(optimizedInput, task);
            case engine_1.CharacterPersonality.MAKOTO:
                return this.applyMakotoOptimizations(optimizedInput, task);
            default:
                return optimizedInput;
        }
    }
    /**
     * Generate personality-influenced response formatting
     */
    formatResponse(result) {
        const profile = this.getPersonalityProfile();
        const comm = profile.communication;
        return {
            ...result,
            personalityFormatting: {
                character: this.currentPersonality,
                verbosity: comm.verbosity,
                tone: comm.tone,
                explanationDepth: comm.explanationDepth,
                feedbackStyle: comm.feedbackStyle
            },
            formattedResult: this.applyCharacterFormatting(result.result, profile)
        };
    }
    /**
     * Character-specific optimization methods
     */
    applyKyokoOptimizations(input, task) {
        return {
            ...input,
            validation: 'strict',
            monitoring: 'detailed',
            analytics: {
                trackPatterns: true,
                auditTrail: true,
                errorAnalysis: 'comprehensive'
            },
            kyokoEnhancements: {
                evidenceGathering: true,
                logicalValidation: true,
                patternCorrelation: true
            }
        };
    }
    applyChihiroOptimizations(input, task) {
        return {
            ...input,
            optimization: 'maximum',
            performance: {
                benchmarking: true,
                profiling: true,
                cacheOptimization: 'aggressive'
            },
            chihiroEnhancements: {
                algorithmicOptimization: true,
                memoryEfficiency: true,
                executionSpeed: 'maximum'
            }
        };
    }
    applyByakuyaOptimizations(input, task) {
        return {
            ...input,
            strategy: 'business_focused',
            governance: {
                compliance: true,
                reporting: 'executive',
                riskManagement: true
            },
            byakuyaEnhancements: {
                strategicAlignment: true,
                resourceManagement: 'enterprise',
                leadershipDecisions: true
            }
        };
    }
    applyTokoOptimizations(input, task) {
        return {
            ...input,
            creativity: 'enhanced',
            innovation: {
                alternativeApproaches: true,
                artisticFlair: true,
                unconventionalSolutions: true
            },
            tokoEnhancements: {
                creativeExploration: true,
                expressiveOutput: true,
                imaginativeProcessing: true
            }
        };
    }
    applyMakotoOptimizations(input, task) {
        return {
            ...input,
            balance: 'optimal',
            reliability: {
                consistency: true,
                fallbackPlanning: true,
                teamCoordination: true
            },
            makotoEnhancements: {
                balancedApproach: true,
                hopefulness: true,
                adaptability: true
            }
        };
    }
    adjustTaskPriority(task, profile) {
        const basePreference = profile.preferences.taskTypes[task.type] || 0.5;
        // Adjust priority based on personality preferences
        if (basePreference > 0.8) {
            return 'high';
        }
        else if (basePreference > 0.6) {
            return 'medium';
        }
        else {
            return task.priority; // Keep original priority
        }
    }
    applyCharacterFormatting(result, profile) {
        const comm = profile.communication;
        return {
            ...result,
            presentation: {
                verbosity: comm.verbosity,
                tone: comm.tone,
                depth: comm.explanationDepth,
                style: comm.feedbackStyle
            },
            characterNote: `Processed with ${profile.name} characteristics`
        };
    }
    /**
     * Record personality usage for analysis
     */
    recordPersonalityUsage(task, result) {
        this.personalityHistory.push({
            personality: this.currentPersonality,
            timestamp: Date.now(),
            task: task.type,
            result: result.route
        });
    }
    /**
     * Get personality usage statistics
     */
    getPersonalityStats() {
        const stats = this.personalityHistory.reduce((acc, entry) => {
            const char = entry.personality;
            if (!acc[char]) {
                acc[char] = { count: 0, routes: {}, tasks: {} };
            }
            acc[char].count++;
            acc[char].routes[entry.result] = (acc[char].routes[entry.result] || 0) + 1;
            acc[char].tasks[entry.task] = (acc[char].tasks[entry.task] || 0) + 1;
            return acc;
        }, {});
        return {
            totalUsage: this.personalityHistory.length,
            characterStats: stats,
            currentPersonality: this.currentPersonality
        };
    }
}
exports.PersonalityEngine = PersonalityEngine;
// Export singleton instance
exports.personalityEngine = new PersonalityEngine();
//# sourceMappingURL=personality-engine.js.map