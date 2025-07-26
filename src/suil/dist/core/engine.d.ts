/**
 * SUIL (Smart Universal Intelligence Layer) Production Engine
 *
 * The core engine that routes tasks through the 80/15/5 intelligence distribution:
 * - 80% Specialized Programs (225,000 ops/sec)
 * - 15% Hybrid Approach (50,000 ops/sec)
 * - 5% Full LLM (10 ops/sec)
 */
export interface Task {
    id: string;
    type: TaskType;
    input: any;
    context?: TaskContext;
    priority: TaskPriority;
    character?: CharacterPersonality;
}
export interface TaskContext {
    project: 'agentledger' | 'icpxmldb' | 'sitebud' | 'icport';
    domain: string;
    patterns?: string[];
    history?: TaskResult[];
}
export interface TaskResult {
    taskId: string;
    result: any;
    processingTime: number;
    route: ProcessingRoute;
    confidence: number;
    character?: CharacterPersonality;
}
export declare enum TaskType {
    CACHE_OPERATION = "cache_operation",
    QUEUE_ROUTING = "queue_routing",
    PATTERN_MATCHING = "pattern_matching",
    CODE_GENERATION = "code_generation",
    SCHEMA_PROCESSING = "schema_processing",
    KIT_BUILDING = "kit_building",
    TRANSLATION = "translation",
    DOM_MANIPULATION = "dom_manipulation",
    DEPLOYMENT = "deployment"
}
export declare enum TaskPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum ProcessingRoute {
    SPECIALIZED = "specialized",
    HYBRID = "hybrid",
    LLM = "llm"
}
export declare enum CharacterPersonality {
    KYOKO = "kyoko",// Analytical, logical, detective-like
    CHIHIRO = "chihiro",// Technical, programming-focused
    BYAKUYA = "byakuya",// Strategic, enterprise-focused
    TOKO = "toko",// Creative, writing-focused
    MAKOTO = "makoto"
}
export interface SpecializedProgram {
    id: string;
    pattern: PatternMatcher;
    execute: (input: any, context?: TaskContext) => Promise<any>;
    performance: {
        opsPerSec: number;
        avgLatency: number;
        successRate: number;
    };
    characterInfluence: CharacterModifier;
    domains: string[];
}
export interface PatternMatcher {
    match: (task: Task) => number;
    extract: (task: Task) => any;
}
export interface CharacterModifier {
    [CharacterPersonality.KYOKO]: (input: any) => any;
    [CharacterPersonality.CHIHIRO]: (input: any) => any;
    [CharacterPersonality.BYAKUYA]: (input: any) => any;
    [CharacterPersonality.TOKO]: (input: any) => any;
    [CharacterPersonality.MAKOTO]: (input: any) => any;
}
export declare class SUILEngine {
    private specializedPrograms;
    private taskHistory;
    private performanceMetrics;
    constructor();
    processTask(task: Task): Promise<TaskResult>;
    private determineProcessingRoute;
    private findBestSpecializedMatch;
    private isHybridCandidate;
    private processSpecialized;
    private processHybrid;
    private processLLM;
    private applyPatterns;
    private selectiveLLMProcessing;
    private calculateConfidence;
    private updateMetrics;
    private initializeSpecializedPrograms;
    registerSpecializedProgram(program: SpecializedProgram): void;
    getPerformanceMetrics(): {
        distribution: {
            specialized: number;
            hybrid: number;
            llm: number;
        };
        totalTasks: number;
        specializedCount: number;
        hybridCount: number;
        llmCount: number;
        avgProcessingTime: number;
    };
    getTaskHistory(): TaskResult[];
}
//# sourceMappingURL=engine.d.ts.map