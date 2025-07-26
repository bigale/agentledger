/**
 * PocketFlow Cookbook Pattern Database
 *
 * Comprehensive mapping of 40+ cookbook patterns to specialized programs
 * Based on SUIL-COOKBOOK-COMPREHENSIVE-ANALYSIS.md
 */
import { SpecializedProgram, Task, CharacterPersonality } from '../core/engine';
export interface CookbookPattern {
    id: string;
    name: string;
    category: string;
    corePattern: string;
    components: string[];
    llmIntegrationPoints: string[];
    linuxMapping: string[];
    suilStrategy: string;
    performanceTarget: {
        opsPerSec: number;
        latency: number;
        successRate: number;
    };
    characterAdaptations: {
        [key in CharacterPersonality]: string;
    };
}
export declare const COOKBOOK_PATTERNS: CookbookPattern[];
/**
 * Pattern Registry for fast lookups and specialized program creation
 */
export declare class PatternRegistry {
    private patterns;
    private categoryIndex;
    constructor();
    private initializePatterns;
    getPattern(id: string): CookbookPattern | undefined;
    getPatternsByCategory(category: string): CookbookPattern[];
    getAllPatterns(): CookbookPattern[];
    findMatchingPatterns(task: Task): CookbookPattern[];
    private calculatePatternMatch;
    private taskTypeMatches;
    private contextMatches;
    private inputMatches;
    private characterCompatible;
    /**
     * Create a specialized program from a cookbook pattern
     */
    createSpecializedProgram(patternId: string): SpecializedProgram | null;
    private executePatternStrategy;
}
export declare const patternRegistry: PatternRegistry;
//# sourceMappingURL=cookbook-patterns.d.ts.map