"use strict";
/**
 * Cross-Project Fusion Analysis System
 *
 * Implements intelligent coordination between all 4 projects:
 * - AgentLedger: Distributed cache/queue system
 * - ICPXMLDB: Universal schema framework
 * - SiteBud: Web meta-layer with HTMZ
 * - ICPort: Docker-like deployment for ICP
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossProjectIntelligence = exports.CrossProjectIntelligence = exports.ProjectType = void 0;
const engine_1 = require("../core/engine");
const personality_engine_1 = require("../characters/personality-engine");
var ProjectType;
(function (ProjectType) {
    ProjectType["AGENTLEDGER"] = "agentledger";
    ProjectType["ICPXMLDB"] = "icpxmldb";
    ProjectType["SITEBUD"] = "sitebud";
    ProjectType["ICPORT"] = "icport";
})(ProjectType || (exports.ProjectType = ProjectType = {}));
class CrossProjectIntelligence {
    constructor() {
        this.projectMetrics = new Map();
        this.crossProjectPatterns = [];
        this.fusionHistory = [];
        this.initializeCrossProjectPatterns();
        this.initializeProjectMetrics();
    }
    /**
     * Analyze task for cross-project optimization opportunities
     */
    analyzeCrossProjectTask(task) {
        const currentProject = this.detectProjectFromTask(task);
        const relatedProjects = this.findRelatedProjects(task);
        const applicablePatterns = this.findApplicablePatterns(task, relatedProjects);
        const fusionOpportunities = this.identifyFusionOpportunities(task, relatedProjects);
        return {
            currentProject,
            relatedProjects,
            applicablePatterns,
            fusionOpportunities,
            recommendedStrategy: this.recommendStrategy(task, applicablePatterns),
            estimatedSpeedup: this.calculateEstimatedSpeedup(fusionOpportunities),
            characterAlignment: this.assessCharacterAlignment(task, applicablePatterns)
        };
    }
    /**
     * Execute cross-project fusion for a task
     */
    async executeFusion(task, analysis) {
        const startTime = performance.now();
        // Apply cross-project optimizations
        const optimizedTask = this.applyFusionOptimizations(task, analysis);
        // Coordinate character influence across projects
        const characterCoordination = this.coordinateCharacterInfluence(optimizedTask, analysis);
        // Execute with fusion patterns
        const result = await this.executeFusionPatterns(optimizedTask, analysis, characterCoordination);
        const executionTime = performance.now() - startTime;
        // Record fusion usage
        this.recordFusionUsage(task, analysis, result, executionTime);
        return {
            originalTask: task,
            fusedResult: result,
            analysis,
            characterCoordination,
            performance: {
                executionTime,
                estimatedSpeedup: analysis.estimatedSpeedup,
                actualSpeedup: this.calculateActualSpeedup(task, result, executionTime)
            },
            projectsSynergized: analysis.relatedProjects.length + 1
        };
    }
    /**
     * Get comprehensive cross-project metrics
     */
    getCrossProjectMetrics() {
        const allMetrics = Array.from(this.projectMetrics.values());
        return {
            overall: {
                totalProjects: allMetrics.length,
                combinedOpsPerSec: allMetrics.reduce((sum, m) => sum + m.performance.opsPerSec, 0),
                averageLatency: allMetrics.reduce((sum, m) => sum + m.performance.avgLatency, 0) / allMetrics.length,
                overallSuccessRate: allMetrics.reduce((sum, m) => sum + m.performance.successRate, 0) / allMetrics.length
            },
            byProject: Object.fromEntries(this.projectMetrics.entries()),
            fusion: {
                totalFusions: this.fusionHistory.length,
                averageSpeedup: this.calculateAverageFusionSpeedup(),
                mostSuccessfulPatterns: this.getMostSuccessfulFusionPatterns(),
                characterUsage: this.getFusionCharacterDistribution()
            },
            synergies: this.analyzeSynergies()
        };
    }
    initializeCrossProjectPatterns() {
        this.crossProjectPatterns = [
            {
                id: 'agentledger_icpxmldb_cache',
                name: 'AgentLedger-ICPXMLDB Schema Caching',
                involvedProjects: [ProjectType.AGENTLEDGER, ProjectType.ICPXMLDB],
                synergies: [
                    {
                        sourceProject: ProjectType.ICPXMLDB,
                        targetProject: ProjectType.AGENTLEDGER,
                        synergyType: 'data_flow',
                        description: 'Cache processed schemas in AgentLedger for instant reuse',
                        impact: 0.8
                    }
                ],
                fusionOpportunities: [
                    {
                        type: 'cache_sharing',
                        description: 'Share schema processing results across instances',
                        benefit: 'Avoid reprocessing common schemas',
                        implementation: 'Universal schema cache with distributed access',
                        estimatedSpeedup: 15
                    }
                ],
                performanceImpact: 0.85,
                characterCompatibility: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.9,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.95,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.8,
                    [engine_1.CharacterPersonality.TOKO]: 0.6,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.7
                }
            },
            {
                id: 'sitebud_icport_deployment',
                name: 'SiteBud-ICPort Web Deployment',
                involvedProjects: [ProjectType.SITEBUD, ProjectType.ICPORT],
                synergies: [
                    {
                        sourceProject: ProjectType.SITEBUD,
                        targetProject: ProjectType.ICPORT,
                        synergyType: 'workflow_integration',
                        description: 'Deploy SiteBud extensions via ICPort containers',
                        impact: 0.9
                    }
                ],
                fusionOpportunities: [
                    {
                        type: 'workflow_integration',
                        description: 'Integrated extension deployment pipeline',
                        benefit: 'One-click extension deployment across platforms',
                        implementation: 'ICPort kits for browser extensions',
                        estimatedSpeedup: 25
                    }
                ],
                performanceImpact: 0.9,
                characterCompatibility: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.7,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.85,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.95,
                    [engine_1.CharacterPersonality.TOKO]: 0.8,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.75
                }
            },
            {
                id: 'all_projects_character_sync',
                name: 'Universal Character Synchronization',
                involvedProjects: [ProjectType.AGENTLEDGER, ProjectType.ICPXMLDB, ProjectType.SITEBUD, ProjectType.ICPORT],
                synergies: [
                    {
                        sourceProject: ProjectType.AGENTLEDGER,
                        targetProject: ProjectType.ICPXMLDB,
                        synergyType: 'character_coordination',
                        description: 'Sync character states across all projects',
                        impact: 0.7
                    }
                ],
                fusionOpportunities: [
                    {
                        type: 'character_coordination',
                        description: 'Unified character intelligence across platforms',
                        benefit: 'Consistent personality-driven optimizations',
                        implementation: 'Central character state management',
                        estimatedSpeedup: 12
                    }
                ],
                performanceImpact: 0.75,
                characterCompatibility: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.85,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.8,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.9,
                    [engine_1.CharacterPersonality.TOKO]: 0.9,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.95
                }
            },
            {
                id: 'icpxmldb_icport_kit_generation',
                name: 'ICPXMLDB-ICPort Kit Generation',
                involvedProjects: [ProjectType.ICPXMLDB, ProjectType.ICPORT],
                synergies: [
                    {
                        sourceProject: ProjectType.ICPXMLDB,
                        targetProject: ProjectType.ICPORT,
                        synergyType: 'pattern_reuse',
                        description: 'Generate ICPort kits from ICPXMLDB schemas',
                        impact: 0.95
                    }
                ],
                fusionOpportunities: [
                    {
                        type: 'pattern_replication',
                        description: 'Automatic kit generation from schema patterns',
                        benefit: 'Instant deployment-ready kits from any schema',
                        implementation: 'Schema-to-kit transformation engine',
                        estimatedSpeedup: 50
                    }
                ],
                performanceImpact: 0.95,
                characterCompatibility: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.8,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.9,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.85,
                    [engine_1.CharacterPersonality.TOKO]: 0.75,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.8
                }
            }
        ];
    }
    initializeProjectMetrics() {
        // Initialize with baseline metrics for each project
        this.projectMetrics.set(ProjectType.AGENTLEDGER, {
            project: ProjectType.AGENTLEDGER,
            performance: { opsPerSec: 225000, avgLatency: 0.004, successRate: 0.995, errorRate: 0.005 },
            usage: { totalTasks: 0, specializedTasks: 0, hybridTasks: 0, llmTasks: 0 },
            patterns: { mostUsed: ['cache_operations', 'queue_routing'], emerging: [], deprecated: [] },
            character: {
                dominant: engine_1.CharacterPersonality.CHIHIRO,
                distribution: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.2,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.4,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.2,
                    [engine_1.CharacterPersonality.TOKO]: 0.1,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.1
                }
            }
        });
        this.projectMetrics.set(ProjectType.ICPXMLDB, {
            project: ProjectType.ICPXMLDB,
            performance: { opsPerSec: 150000, avgLatency: 0.007, successRate: 0.98, errorRate: 0.02 },
            usage: { totalTasks: 0, specializedTasks: 0, hybridTasks: 0, llmTasks: 0 },
            patterns: { mostUsed: ['schema_processing', 'code_generation'], emerging: [], deprecated: [] },
            character: {
                dominant: engine_1.CharacterPersonality.KYOKO,
                distribution: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.35,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.3,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.15,
                    [engine_1.CharacterPersonality.TOKO]: 0.1,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.1
                }
            }
        });
        this.projectMetrics.set(ProjectType.SITEBUD, {
            project: ProjectType.SITEBUD,
            performance: { opsPerSec: 75000, avgLatency: 0.013, successRate: 0.92, errorRate: 0.08 },
            usage: { totalTasks: 0, specializedTasks: 0, hybridTasks: 0, llmTasks: 0 },
            patterns: { mostUsed: ['dom_manipulation', 'translation'], emerging: [], deprecated: [] },
            character: {
                dominant: engine_1.CharacterPersonality.TOKO,
                distribution: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.1,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.2,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.15,
                    [engine_1.CharacterPersonality.TOKO]: 0.4,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.15
                }
            }
        });
        this.projectMetrics.set(ProjectType.ICPORT, {
            project: ProjectType.ICPORT,
            performance: { opsPerSec: 100000, avgLatency: 0.01, successRate: 0.96, errorRate: 0.04 },
            usage: { totalTasks: 0, specializedTasks: 0, hybridTasks: 0, llmTasks: 0 },
            patterns: { mostUsed: ['kit_building', 'deployment'], emerging: [], deprecated: [] },
            character: {
                dominant: engine_1.CharacterPersonality.BYAKUYA,
                distribution: {
                    [engine_1.CharacterPersonality.KYOKO]: 0.15,
                    [engine_1.CharacterPersonality.CHIHIRO]: 0.25,
                    [engine_1.CharacterPersonality.BYAKUYA]: 0.4,
                    [engine_1.CharacterPersonality.TOKO]: 0.1,
                    [engine_1.CharacterPersonality.MAKOTO]: 0.1
                }
            }
        });
    }
    detectProjectFromTask(task) {
        const context = task.context;
        if (context?.project) {
            return context.project;
        }
        // Infer from task type and patterns
        switch (task.type) {
            case 'cache_operation':
            case 'queue_routing':
                return ProjectType.AGENTLEDGER;
            case 'schema_processing':
            case 'code_generation':
                return ProjectType.ICPXMLDB;
            case 'dom_manipulation':
            case 'translation':
                return ProjectType.SITEBUD;
            case 'kit_building':
            case 'deployment':
                return ProjectType.ICPORT;
            default:
                return ProjectType.AGENTLEDGER; // Default fallback
        }
    }
    findRelatedProjects(task) {
        const related = [];
        // Find projects that could benefit from or contribute to this task
        for (const pattern of this.crossProjectPatterns) {
            const relevance = this.calculatePatternRelevance(task, pattern);
            if (relevance > 0.5) {
                related.push(...pattern.involvedProjects);
            }
        }
        return [...new Set(related)]; // Remove duplicates
    }
    findApplicablePatterns(task, relatedProjects) {
        return this.crossProjectPatterns.filter(pattern => {
            const relevance = this.calculatePatternRelevance(task, pattern);
            const projectOverlap = pattern.involvedProjects.some(p => relatedProjects.includes(p));
            return relevance > 0.4 && projectOverlap;
        });
    }
    calculatePatternRelevance(task, pattern) {
        let relevance = 0;
        // Character compatibility
        const character = task.character || personality_engine_1.personalityEngine.getCurrentPersonality();
        relevance += pattern.characterCompatibility[character] * 0.3;
        // Performance impact
        relevance += pattern.performanceImpact * 0.4;
        // Project involvement
        const currentProject = this.detectProjectFromTask(task);
        if (pattern.involvedProjects.includes(currentProject)) {
            relevance += 0.3;
        }
        return Math.min(relevance, 1.0);
    }
    identifyFusionOpportunities(task, relatedProjects) {
        const opportunities = [];
        for (const pattern of this.crossProjectPatterns) {
            if (pattern.involvedProjects.some(p => relatedProjects.includes(p))) {
                opportunities.push(...pattern.fusionOpportunities);
            }
        }
        return opportunities;
    }
    recommendStrategy(task, patterns) {
        if (patterns.length === 0) {
            return { type: 'single_project', confidence: 0.5 };
        }
        const bestPattern = patterns.reduce((best, current) => current.performanceImpact > best.performanceImpact ? current : best);
        return {
            type: 'cross_project_fusion',
            pattern: bestPattern.id,
            confidence: bestPattern.performanceImpact,
            estimatedBenefit: bestPattern.fusionOpportunities.reduce((sum, opp) => sum + opp.estimatedSpeedup, 0)
        };
    }
    calculateEstimatedSpeedup(opportunities) {
        if (opportunities.length === 0)
            return 1;
        // Calculate compound speedup (not additive to avoid unrealistic numbers)
        return opportunities.reduce((speedup, opp) => speedup * (1 + opp.estimatedSpeedup / 100), 1);
    }
    assessCharacterAlignment(task, patterns) {
        const character = task.character || personality_engine_1.personalityEngine.getCurrentPersonality();
        const alignments = patterns.map(pattern => ({
            pattern: pattern.id,
            alignment: pattern.characterCompatibility[character]
        }));
        const averageAlignment = alignments.length > 0
            ? alignments.reduce((sum, a) => sum + a.alignment, 0) / alignments.length
            : 0.5;
        return {
            character,
            averageAlignment,
            bestPattern: alignments.length > 0
                ? alignments.reduce((best, current) => current.alignment > best.alignment ? current : best)
                : null,
            recommendation: averageAlignment > 0.7 ? 'proceed' : averageAlignment > 0.4 ? 'proceed_with_caution' : 'consider_alternative'
        };
    }
    // Additional helper methods would be implemented here...
    applyFusionOptimizations(task, analysis) {
        // Implementation for applying cross-project optimizations
        return { ...task, fusionOptimizations: analysis.fusionOpportunities };
    }
    coordinateCharacterInfluence(task, analysis) {
        // Implementation for coordinating character influence across projects
        return { character: task.character, coordination: 'active' };
    }
    async executeFusionPatterns(task, analysis, coordination) {
        // Implementation for executing fusion patterns
        return { fusionExecuted: true, patterns: analysis.applicablePatterns.length };
    }
    calculateActualSpeedup(task, result, executionTime) {
        // Implementation for calculating actual vs estimated speedup
        return 1.5; // Placeholder
    }
    recordFusionUsage(task, analysis, result, executionTime) {
        this.fusionHistory.push({
            timestamp: Date.now(),
            projects: [this.detectProjectFromTask(task), ...analysis.relatedProjects],
            pattern: analysis.recommendedStrategy.pattern || 'unknown',
            character: task.character || engine_1.CharacterPersonality.MAKOTO,
            performance: 1000 / executionTime // ops per second
        });
    }
    calculateAverageFusionSpeedup() {
        return this.fusionHistory.length > 0
            ? this.fusionHistory.reduce((sum, entry) => sum + entry.performance, 0) / this.fusionHistory.length
            : 0;
    }
    getMostSuccessfulFusionPatterns() {
        const patternCounts = this.fusionHistory.reduce((acc, entry) => {
            acc[entry.pattern] = (acc[entry.pattern] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(patternCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([pattern]) => pattern);
    }
    getFusionCharacterDistribution() {
        const total = this.fusionHistory.length;
        if (total === 0) {
            return {
                [engine_1.CharacterPersonality.KYOKO]: 0,
                [engine_1.CharacterPersonality.CHIHIRO]: 0,
                [engine_1.CharacterPersonality.BYAKUYA]: 0,
                [engine_1.CharacterPersonality.TOKO]: 0,
                [engine_1.CharacterPersonality.MAKOTO]: 0
            };
        }
        const counts = this.fusionHistory.reduce((acc, entry) => {
            acc[entry.character] = (acc[entry.character] || 0) + 1;
            return acc;
        }, {});
        return {
            [engine_1.CharacterPersonality.KYOKO]: (counts[engine_1.CharacterPersonality.KYOKO] || 0) / total,
            [engine_1.CharacterPersonality.CHIHIRO]: (counts[engine_1.CharacterPersonality.CHIHIRO] || 0) / total,
            [engine_1.CharacterPersonality.BYAKUYA]: (counts[engine_1.CharacterPersonality.BYAKUYA] || 0) / total,
            [engine_1.CharacterPersonality.TOKO]: (counts[engine_1.CharacterPersonality.TOKO] || 0) / total,
            [engine_1.CharacterPersonality.MAKOTO]: (counts[engine_1.CharacterPersonality.MAKOTO] || 0) / total
        };
    }
    analyzeSynergies() {
        // Implementation for analyzing project synergies
        return { totalSynergies: this.crossProjectPatterns.length };
    }
}
exports.CrossProjectIntelligence = CrossProjectIntelligence;
// Export singleton instance
exports.crossProjectIntelligence = new CrossProjectIntelligence();
//# sourceMappingURL=cross-project-intelligence.js.map