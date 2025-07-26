/**
 * High-Performance Cache Operations Specialist
 * Target: 225,000 ops/sec for routine cache operations
 */
import { SpecializedProgram, Task, CharacterPersonality } from '../core/engine';
export declare class CacheSpecialist implements SpecializedProgram {
    id: string;
    private operationHandlers;
    private characterOptimizations;
    pattern: {
        match: (task: Task) => number;
        extract: (task: Task) => {
            operation: any;
            key: any;
            value: any;
            options: any;
            character: CharacterPersonality | undefined;
        };
    };
    execute(input: any, context?: any): Promise<any>;
    performance: {
        opsPerSec: number;
        avgLatency: number;
        successRate: number;
    };
    characterInfluence: {
        kyoko: (input: any) => any;
        chihiro: (input: any) => any;
        byakuya: (input: any) => any;
        toko: (input: any) => any;
        makoto: (input: any) => any;
    };
    domains: string[];
    private handleSet;
    private handleGet;
    private handleDelete;
    private handleExists;
    private handleTTL;
    private handleExpire;
    private isCacheLikeOperation;
    private applyCharacterOptimizations;
    private calculateSize;
}
/**
 * Queue Routing Specialist
 * Target: 200,000 ops/sec for queue operations
 */
export declare class QueueRoutingSpecialist implements SpecializedProgram {
    id: string;
    private routingStrategies;
    pattern: {
        match: (task: Task) => number;
        extract: (task: Task) => {
            strategy: any;
            items: any;
            criteria: any;
            character: CharacterPersonality | undefined;
        };
    };
    execute(input: any, context?: any): Promise<any>;
    performance: {
        opsPerSec: number;
        avgLatency: number;
        successRate: number;
    };
    characterInfluence: {
        kyoko: (input: any) => any;
        chihiro: (input: any) => any;
        byakuya: (input: any) => any;
        toko: (input: any) => any;
        makoto: (input: any) => any;
    };
    domains: string[];
    private handleFIFO;
    private handleLIFO;
    private handlePriority;
    private handleRoundRobin;
    private handleWeighted;
    private handleLeastLoaded;
}
//# sourceMappingURL=cache-specialist.d.ts.map