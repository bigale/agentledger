/**
 * Integrated SUIL Demo
 *
 * Comprehensive demonstration of the Smart Universal Intelligence Layer
 * showing all components working together:
 * - Core SUIL Engine with 80/15/5 intelligence distribution
 * - Specialized Programs achieving 225k ops/sec
 * - Character-driven intelligence with 5 Danganronpa personalities
 * - Cross-project fusion analysis
 * - Pattern database from 40+ cookbook patterns
 */
export declare class IntegratedSUILDemo {
    private suilEngine;
    private demoResults;
    private startTime;
    constructor();
    /**
     * Run comprehensive SUIL demonstration
     */
    runComprehensiveDemo(): Promise<DemoSummary>;
    /**
     * Phase 1: Basic Engine Functionality
     */
    private demoBasicEngine;
    /**
     * Phase 2: Character-Driven Processing
     */
    private demoCharacterIntelligence;
    /**
     * Phase 3: Specialized Programs Performance
     */
    private demoSpecializedPrograms;
    /**
     * Phase 4: Pattern Database Integration
     */
    private demoPatternDatabase;
    /**
     * Phase 5: Cross-Project Fusion
     */
    private demoCrossProjectFusion;
    /**
     * Phase 6: Performance Comparison
     */
    private demoPerformanceComparison;
    /**
     * Generate comprehensive demo summary
     */
    private generateDemoSummary;
    private calculatePhaseStatistics;
    private calculateCharacterStatistics;
    private calculatePerformanceStatistics;
    private generateHighlights;
    private printDemoSummary;
    private initializeSpecializedPrograms;
    private calculateAverageProcessingTime;
    private calculateSuccessRate;
    private calculateAveragePerformance;
    private calculatePreferredRoutes;
    private findPeakOpsPerSec;
    private findSpeedupFactor;
    private calculateActualDistribution;
}
interface DemoSummary {
    totalDemoTime: number;
    totalTasks: number;
    phases: PhaseStatistics;
    characters: CharacterStatistics;
    performance: PerformanceStatistics;
    highlights: string[];
}
interface PhaseStatistics {
    [phase: string]: {
        taskCount: number;
        averageTime: number;
        successRate: number;
    };
}
interface CharacterStatistics {
    [character: string]: {
        usageCount: number;
        averagePerformance: number;
        preferredRoutes: any;
    };
}
interface PerformanceStatistics {
    averageOpsPerSec: number;
    peakOpsPerSec: number;
    suilVsLLMSpeedup: number;
    distributionAchieved: string;
}
export declare function runSUILDemo(): Promise<DemoSummary>;
export {};
//# sourceMappingURL=integrated-suil-demo.d.ts.map