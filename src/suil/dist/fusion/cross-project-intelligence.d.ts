/**
 * Cross-Project Fusion Analysis System
 *
 * Implements intelligent coordination between all 4 projects:
 * - AgentLedger: Distributed cache/queue system
 * - ICPXMLDB: Universal schema framework
 * - SiteBud: Web meta-layer with HTMZ
 * - ICPort: Docker-like deployment for ICP
 */
import { Task, CharacterPersonality } from '../core/engine';
export interface ProjectMetrics {
    project: ProjectType;
    performance: {
        opsPerSec: number;
        avgLatency: number;
        successRate: number;
        errorRate: number;
    };
    usage: {
        totalTasks: number;
        specializedTasks: number;
        hybridTasks: number;
        llmTasks: number;
    };
    patterns: {
        mostUsed: string[];
        emerging: string[];
        deprecated: string[];
    };
    character: {
        dominant: CharacterPersonality;
        distribution: {
            [key in CharacterPersonality]: number;
        };
    };
}
export declare enum ProjectType {
    AGENTLEDGER = "agentledger",
    ICPXMLDB = "icpxmldb",
    SITEBUD = "sitebud",
    ICPORT = "icport"
}
export interface CrossProjectPattern {
    id: string;
    name: string;
    involvedProjects: ProjectType[];
    synergies: ProjectSynergy[];
    fusionOpportunities: FusionOpportunity[];
    performanceImpact: number;
    characterCompatibility: {
        [key in CharacterPersonality]: number;
    };
}
export interface ProjectSynergy {
    sourceProject: ProjectType;
    targetProject: ProjectType;
    synergyType: 'data_flow' | 'processing_optimization' | 'resource_sharing' | 'pattern_reuse';
    description: string;
    impact: number;
}
export interface FusionOpportunity {
    type: 'cache_sharing' | 'pattern_replication' | 'character_coordination' | 'workflow_integration';
    description: string;
    benefit: string;
    implementation: string;
    estimatedSpeedup: number;
}
export declare class CrossProjectIntelligence {
    private projectMetrics;
    private crossProjectPatterns;
    private fusionHistory;
    constructor();
    /**
     * Analyze task for cross-project optimization opportunities
     */
    analyzeCrossProjectTask(task: Task): CrossProjectAnalysis;
    /**
     * Execute cross-project fusion for a task
     */
    executeFusion(task: Task, analysis: CrossProjectAnalysis): Promise<FusionResult>;
    /**
     * Get comprehensive cross-project metrics
     */
    getCrossProjectMetrics(): CrossProjectMetrics;
    private initializeCrossProjectPatterns;
    private initializeProjectMetrics;
    private detectProjectFromTask;
    private findRelatedProjects;
    private findApplicablePatterns;
    private calculatePatternRelevance;
    private identifyFusionOpportunities;
    private recommendStrategy;
    private calculateEstimatedSpeedup;
    private assessCharacterAlignment;
    private applyFusionOptimizations;
    private coordinateCharacterInfluence;
    private executeFusionPatterns;
    private calculateActualSpeedup;
    private recordFusionUsage;
    private calculateAverageFusionSpeedup;
    private getMostSuccessfulFusionPatterns;
    private getFusionCharacterDistribution;
    private analyzeSynergies;
}
export interface CrossProjectAnalysis {
    currentProject: ProjectType;
    relatedProjects: ProjectType[];
    applicablePatterns: CrossProjectPattern[];
    fusionOpportunities: FusionOpportunity[];
    recommendedStrategy: FusionStrategy;
    estimatedSpeedup: number;
    characterAlignment: CharacterAlignment;
}
export interface FusionResult {
    originalTask: Task;
    fusedResult: any;
    analysis: CrossProjectAnalysis;
    characterCoordination: any;
    performance: {
        executionTime: number;
        estimatedSpeedup: number;
        actualSpeedup: number;
    };
    projectsSynergized: number;
}
export interface FusionStrategy {
    type: 'single_project' | 'cross_project_fusion';
    pattern?: string;
    confidence: number;
    estimatedBenefit?: number;
}
export interface CharacterAlignment {
    character: CharacterPersonality;
    averageAlignment: number;
    bestPattern: {
        pattern: string;
        alignment: number;
    } | null;
    recommendation: 'proceed' | 'proceed_with_caution' | 'consider_alternative';
}
export interface CrossProjectMetrics {
    overall: {
        totalProjects: number;
        combinedOpsPerSec: number;
        averageLatency: number;
        overallSuccessRate: number;
    };
    byProject: {
        [key in ProjectType]: ProjectMetrics;
    };
    fusion: {
        totalFusions: number;
        averageSpeedup: number;
        mostSuccessfulPatterns: string[];
        characterUsage: {
            [key in CharacterPersonality]: number;
        };
    };
    synergies: any;
}
export declare const crossProjectIntelligence: CrossProjectIntelligence;
//# sourceMappingURL=cross-project-intelligence.d.ts.map