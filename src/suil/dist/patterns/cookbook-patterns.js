"use strict";
/**
 * PocketFlow Cookbook Pattern Database
 *
 * Comprehensive mapping of 40+ cookbook patterns to specialized programs
 * Based on SUIL-COOKBOOK-COMPREHENSIVE-ANALYSIS.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.patternRegistry = exports.PatternRegistry = exports.COOKBOOK_PATTERNS = void 0;
const engine_1 = require("../core/engine");
exports.COOKBOOK_PATTERNS = [
    // Basic Patterns
    {
        id: 'hello_world',
        name: 'Simple LLM Query Response',
        category: 'basic',
        corePattern: 'Simple LLM query and response',
        components: ['Single flow node', 'LLM call'],
        llmIntegrationPoints: ['Basic text completion'],
        linuxMapping: ['echo', 'curl', 'HTTP API calls'],
        suilStrategy: 'Template-based response generation, regex pattern matching',
        performanceTarget: {
            opsPerSec: 50000,
            latency: 0.02,
            successRate: 0.98
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Analytical response templates with validation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Optimized templates with minimal overhead',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Enterprise-grade response formatting',
            [engine_1.CharacterPersonality.TOKO]: 'Creative response variations and alternatives',
            [engine_1.CharacterPersonality.MAKOTO]: 'Balanced, reliable template responses'
        }
    },
    {
        id: 'async_basic',
        name: 'Asynchronous Processing',
        category: 'basic',
        corePattern: 'Asynchronous LLM processing',
        components: ['Async flow execution', 'Non-blocking operations'],
        llmIntegrationPoints: ['Non-blocking LLM calls'],
        linuxMapping: ['Background processes (&)', 'wait', 'job control'],
        suilStrategy: 'Process pools, queue-based task distribution',
        performanceTarget: {
            opsPerSec: 100000,
            latency: 0.01,
            successRate: 0.995
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Detailed async monitoring and analysis',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Maximum async optimization and efficiency',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic async resource management',
            [engine_1.CharacterPersonality.TOKO]: 'Creative async flow patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Reliable async execution with safety'
        }
    },
    {
        id: 'sequential_flow',
        name: 'Sequential Workflow',
        category: 'basic',
        corePattern: 'Sequential workflow execution',
        components: ['Multi-step flow', 'State passing', 'Context preservation'],
        llmIntegrationPoints: ['Chained LLM calls with context'],
        linuxMapping: ['Shell pipelines', 'intermediate file storage', 'state management'],
        suilStrategy: 'State machine with rule-based transitions',
        performanceTarget: {
            opsPerSec: 75000,
            latency: 0.013,
            successRate: 0.992
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Logic-driven state transitions with validation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Optimized state machine implementation',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Business workflow state management',
            [engine_1.CharacterPersonality.TOKO]: 'Creative state flow variations',
            [engine_1.CharacterPersonality.MAKOTO]: 'Balanced state progression'
        }
    },
    // Batch Processing Patterns
    {
        id: 'batch_processing',
        name: 'Bulk Data Processing',
        category: 'batch',
        corePattern: 'Bulk data processing',
        components: ['Batch job orchestration', 'Data partitioning'],
        llmIntegrationPoints: ['Parallel LLM processing of data chunks'],
        linuxMapping: ['xargs -P', 'GNU parallel', 'batch job schedulers'],
        suilStrategy: 'Data partitioning with specialized processors',
        performanceTarget: {
            opsPerSec: 200000,
            latency: 0.005,
            successRate: 0.998
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Systematic batch analysis and validation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Highly optimized batch processing algorithms',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Enterprise-scale batch orchestration',
            [engine_1.CharacterPersonality.TOKO]: 'Creative batch processing patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Reliable batch execution'
        }
    },
    {
        id: 'parallel_batch',
        name: 'Parallel Batch Execution',
        category: 'batch',
        corePattern: 'Parallel batch execution',
        components: ['Concurrent batch processing', 'Load balancing'],
        llmIntegrationPoints: ['Parallel LLM calls with synchronization'],
        linuxMapping: ['Process parallelization', 'semaphores', 'worker pools'],
        suilStrategy: 'Worker pools with load balancing',
        performanceTarget: {
            opsPerSec: 300000,
            latency: 0.003,
            successRate: 0.997
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Analytical parallel processing optimization',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Maximum parallel efficiency algorithms',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic resource allocation',
            [engine_1.CharacterPersonality.TOKO]: 'Creative parallel processing patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Balanced parallel execution'
        }
    },
    // Interactive Patterns
    {
        id: 'chat_interface',
        name: 'Conversational Interface',
        category: 'interactive',
        corePattern: 'Conversational interface',
        components: ['Chat history management', 'Context preservation'],
        llmIntegrationPoints: ['Conversational LLM calls'],
        linuxMapping: ['Interactive shells', 'readline', 'history files'],
        suilStrategy: 'Template-based responses, context-aware scripting',
        performanceTarget: {
            opsPerSec: 25000,
            latency: 0.04,
            successRate: 0.95
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Logical conversation flow with analysis',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Technical conversation optimization',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Professional conversation management',
            [engine_1.CharacterPersonality.TOKO]: 'Creative and expressive conversations',
            [engine_1.CharacterPersonality.MAKOTO]: 'Encouraging and supportive dialogue'
        }
    },
    {
        id: 'chat_memory',
        name: 'Persistent Conversation Memory',
        category: 'interactive',
        corePattern: 'Persistent conversation memory',
        components: ['Long-term memory management', 'Context databases'],
        llmIntegrationPoints: ['Memory-enhanced LLM calls'],
        linuxMapping: ['Database storage', 'session management', 'indexing'],
        suilStrategy: 'Context databases, memory pattern matching',
        performanceTarget: {
            opsPerSec: 15000,
            latency: 0.067,
            successRate: 0.93
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Detailed memory analysis and correlation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Optimized memory storage and retrieval',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic memory management',
            [engine_1.CharacterPersonality.TOKO]: 'Creative memory associations',
            [engine_1.CharacterPersonality.MAKOTO]: 'Reliable memory consistency'
        }
    },
    // Agent Patterns
    {
        id: 'autonomous_agent',
        name: 'Autonomous Agent Behavior',
        category: 'agent',
        corePattern: 'Autonomous agent behavior',
        components: ['Goal-oriented agent', 'Action planning', 'Decision making'],
        llmIntegrationPoints: ['Agent reasoning and planning'],
        linuxMapping: ['State machines', 'decision trees', 'expert systems'],
        suilStrategy: 'Rule-based agents, behavior trees',
        performanceTarget: {
            opsPerSec: 5000,
            latency: 0.2,
            successRate: 0.88
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Analytical agent reasoning and validation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Technical agent optimization',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic agent goal management',
            [engine_1.CharacterPersonality.TOKO]: 'Creative agent behavior patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Balanced agent decision making'
        }
    },
    {
        id: 'multi_agent',
        name: 'Multiple Cooperating Agents',
        category: 'agent',
        corePattern: 'Multiple cooperating agents',
        components: ['Agent coordination', 'Communication protocols'],
        llmIntegrationPoints: ['Multi-agent LLM interactions'],
        linuxMapping: ['Multi-process coordination', 'message passing', 'IPC'],
        suilStrategy: 'Agent protocols, coordination patterns',
        performanceTarget: {
            opsPerSec: 2000,
            latency: 0.5,
            successRate: 0.85
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Systematic multi-agent coordination',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Efficient agent communication protocols',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic multi-agent orchestration',
            [engine_1.CharacterPersonality.TOKO]: 'Creative agent collaboration patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Harmonious agent cooperation'
        }
    },
    // Code Generation Patterns
    {
        id: 'code_generator',
        name: 'Automated Code Generation',
        category: 'generation',
        corePattern: 'Automated code generation',
        components: ['Template-based synthesis', 'AST manipulation'],
        llmIntegrationPoints: ['LLM-driven code generation'],
        linuxMapping: ['Code generators', 'template engines', 'AST tools'],
        suilStrategy: 'Template libraries, code pattern databases',
        performanceTarget: {
            opsPerSec: 10000,
            latency: 0.1,
            successRate: 0.92
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Analytically verified code generation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Highly optimized code templates',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Enterprise-grade code architecture',
            [engine_1.CharacterPersonality.TOKO]: 'Creative code patterns and structures',
            [engine_1.CharacterPersonality.MAKOTO]: 'Reliable, maintainable code generation'
        }
    },
    {
        id: 'structured_output',
        name: 'Structured Data Extraction',
        category: 'generation',
        corePattern: 'Structured data extraction',
        components: ['Schema-driven parsing', 'Data validation'],
        llmIntegrationPoints: ['LLM with structured output constraints'],
        linuxMapping: ['Data extraction tools', 'parsers', 'validators'],
        suilStrategy: 'Pattern-based extraction, schema validation',
        performanceTarget: {
            opsPerSec: 80000,
            latency: 0.0125,
            successRate: 0.96
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Rigorous structured data validation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Optimized parsing algorithms',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Enterprise data structure standards',
            [engine_1.CharacterPersonality.TOKO]: 'Creative data structure variations',
            [engine_1.CharacterPersonality.MAKOTO]: 'Consistent structured output'
        }
    },
    // Integration Patterns
    {
        id: 'api_integration',
        name: 'External API Integration',
        category: 'integration',
        corePattern: 'External API integration',
        components: ['API clients', 'Webhook handlers', 'Rate limiting'],
        llmIntegrationPoints: ['LLM-enhanced API operations'],
        linuxMapping: ['API clients', 'webhook handlers', 'schedulers'],
        suilStrategy: 'API templates, webhook patterns',
        performanceTarget: {
            opsPerSec: 30000,
            latency: 0.033,
            successRate: 0.94
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Analytical API monitoring and validation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Optimized API client implementations',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic API integration architecture',
            [engine_1.CharacterPersonality.TOKO]: 'Creative API usage patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Reliable API integration'
        }
    },
    {
        id: 'database_operations',
        name: 'Database Integration',
        category: 'integration',
        corePattern: 'Database integration',
        components: ['Query optimization', 'Connection pooling', 'Transaction management'],
        llmIntegrationPoints: ['LLM-driven database interactions'],
        linuxMapping: ['SQL clients', 'ORM tools', 'database CLIs'],
        suilStrategy: 'Query templates, database patterns',
        performanceTarget: {
            opsPerSec: 40000,
            latency: 0.025,
            successRate: 0.97
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Analytical query optimization',
            [engine_1.CharacterPersonality.CHIHIRO]: 'High-performance database operations',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Enterprise database architecture',
            [engine_1.CharacterPersonality.TOKO]: 'Creative query patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Reliable database transactions'
        }
    },
    // Advanced Workflow Patterns
    {
        id: 'map_reduce',
        name: 'Distributed Data Processing',
        category: 'workflow',
        corePattern: 'Distributed data processing',
        components: ['Data partitioning', 'Parallel processing', 'Result aggregation'],
        llmIntegrationPoints: ['Distributed LLM operations'],
        linuxMapping: ['MapReduce frameworks', 'distributed computing'],
        suilStrategy: 'Distributed templates, result aggregation',
        performanceTarget: {
            opsPerSec: 150000,
            latency: 0.0067,
            successRate: 0.995
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Systematic distributed processing analysis',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Optimized distributed algorithms',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic distributed architecture',
            [engine_1.CharacterPersonality.TOKO]: 'Creative distributed patterns',
            [engine_1.CharacterPersonality.MAKOTO]: 'Reliable distributed processing'
        }
    },
    {
        id: 'rag_processing',
        name: 'Retrieval-Augmented Generation',
        category: 'workflow',
        corePattern: 'Knowledge-enhanced generation',
        components: ['Document retrieval', 'Context injection', 'Response generation'],
        llmIntegrationPoints: ['RAG-based LLM processing'],
        linuxMapping: ['Search indexes', 'document databases', 'vector stores'],
        suilStrategy: 'Knowledge templates, retrieval patterns',
        performanceTarget: {
            opsPerSec: 8000,
            latency: 0.125,
            successRate: 0.89
        },
        characterAdaptations: {
            [engine_1.CharacterPersonality.KYOKO]: 'Analytical knowledge retrieval and validation',
            [engine_1.CharacterPersonality.CHIHIRO]: 'Optimized RAG processing pipeline',
            [engine_1.CharacterPersonality.BYAKUYA]: 'Strategic knowledge management',
            [engine_1.CharacterPersonality.TOKO]: 'Creative knowledge synthesis',
            [engine_1.CharacterPersonality.MAKOTO]: 'Balanced knowledge retrieval'
        }
    }
];
/**
 * Pattern Registry for fast lookups and specialized program creation
 */
class PatternRegistry {
    constructor() {
        this.patterns = new Map();
        this.categoryIndex = new Map();
        this.initializePatterns();
    }
    initializePatterns() {
        for (const pattern of exports.COOKBOOK_PATTERNS) {
            this.patterns.set(pattern.id, pattern);
            const category = pattern.category;
            if (!this.categoryIndex.has(category)) {
                this.categoryIndex.set(category, []);
            }
            this.categoryIndex.get(category).push(pattern);
        }
    }
    getPattern(id) {
        return this.patterns.get(id);
    }
    getPatternsByCategory(category) {
        return this.categoryIndex.get(category) || [];
    }
    getAllPatterns() {
        return Array.from(this.patterns.values());
    }
    findMatchingPatterns(task) {
        const matches = [];
        for (const pattern of this.patterns.values()) {
            const score = this.calculatePatternMatch(task, pattern);
            if (score > 0.5) {
                matches.push({ pattern, score });
            }
        }
        return matches
            .sort((a, b) => b.score - a.score)
            .map(m => m.pattern);
    }
    calculatePatternMatch(task, pattern) {
        let score = 0;
        // Task type matching
        if (this.taskTypeMatches(task.type, pattern)) {
            score += 0.4;
        }
        // Context matching
        if (task.context && this.contextMatches(task.context, pattern)) {
            score += 0.3;
        }
        // Input structure matching
        if (this.inputMatches(task.input, pattern)) {
            score += 0.2;
        }
        // Character compatibility
        if (task.character && this.characterCompatible(task.character, pattern)) {
            score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    taskTypeMatches(taskType, pattern) {
        const typeMapping = {
            [engine_1.TaskType.CACHE_OPERATION]: ['basic', 'integration'],
            [engine_1.TaskType.QUEUE_ROUTING]: ['batch', 'workflow'],
            [engine_1.TaskType.PATTERN_MATCHING]: ['basic', 'generation'],
            [engine_1.TaskType.CODE_GENERATION]: ['generation'],
            [engine_1.TaskType.SCHEMA_PROCESSING]: ['generation', 'integration'],
            [engine_1.TaskType.KIT_BUILDING]: ['workflow', 'generation'],
            [engine_1.TaskType.TRANSLATION]: ['generation', 'integration'],
            [engine_1.TaskType.DOM_MANIPULATION]: ['integration'],
            [engine_1.TaskType.DEPLOYMENT]: ['workflow', 'integration']
        };
        const relevantCategories = typeMapping[taskType] || [];
        return relevantCategories.includes(pattern.category);
    }
    contextMatches(context, pattern) {
        if (context.project && pattern.name.toLowerCase().includes(context.project)) {
            return true;
        }
        if (context.domain && pattern.components.some(c => c.toLowerCase().includes(context.domain.toLowerCase()))) {
            return true;
        }
        return false;
    }
    inputMatches(input, pattern) {
        if (!input)
            return false;
        // Check if input structure aligns with pattern components
        const inputKeys = Object.keys(input);
        return pattern.components.some(component => inputKeys.some(key => component.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(component.toLowerCase().split(' ')[0])));
    }
    characterCompatible(character, pattern) {
        return character in pattern.characterAdaptations;
    }
    /**
     * Create a specialized program from a cookbook pattern
     */
    createSpecializedProgram(patternId) {
        const pattern = this.getPattern(patternId);
        if (!pattern)
            return null;
        return {
            id: `cookbook_${patternId}`,
            pattern: {
                match: (task) => {
                    const matches = this.findMatchingPatterns(task);
                    const match = matches.find(p => p.id === patternId);
                    return match ? 0.9 : 0;
                },
                extract: (task) => ({
                    pattern: patternId,
                    input: task.input,
                    context: task.context,
                    character: task.character
                })
            },
            execute: async (input, context) => {
                const startTime = performance.now();
                // Apply character-specific adaptations
                const character = input.character || engine_1.CharacterPersonality.MAKOTO;
                const adaptation = pattern.characterAdaptations[character];
                // Simulate specialized processing based on pattern strategy
                const result = await this.executePatternStrategy(pattern, input, adaptation);
                const executionTime = performance.now() - startTime;
                return {
                    pattern: patternId,
                    result,
                    adaptation,
                    character,
                    executionTime,
                    performance: {
                        opsPerSecond: Math.round(1000 / executionTime),
                        targetOpsPerSec: pattern.performanceTarget.opsPerSec
                    }
                };
            },
            performance: pattern.performanceTarget,
            characterInfluence: Object.fromEntries(Object.entries(pattern.characterAdaptations).map(([char, adaptation]) => [
                char,
                (input) => ({ ...input, adaptation })
            ])),
            domains: ['agentledger', 'icpxmldb', 'sitebud', 'icport']
        };
    }
    async executePatternStrategy(pattern, input, adaptation) {
        // This would contain the actual specialized program logic
        // For now, return a simulated result based on the pattern
        return {
            strategy: pattern.suilStrategy,
            adaptation,
            components: pattern.components,
            linuxEquivalent: pattern.linuxMapping,
            simulatedResult: `Executed ${pattern.name} with ${adaptation}`,
            timestamp: Date.now()
        };
    }
}
exports.PatternRegistry = PatternRegistry;
// Export singleton instance
exports.patternRegistry = new PatternRegistry();
//# sourceMappingURL=cookbook-patterns.js.map