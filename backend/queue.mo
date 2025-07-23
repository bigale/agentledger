import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import Cycles "mo:base/ExperimentalCycles";
import Int "mo:base/Int";
import Bool "mo:base/Bool";
import AdminSystem "auth-single-user/management";
import Principal "mo:base/Principal";

persistent actor QueueCanister {
    // Initialize the admin system state
    let adminState = AdminSystem.initState();

    type Key = Text;
    type Value = Text;
    type OperationId = Text;
    type Timestamp = Int;

    type QueueOperation = {
        #Set : { key : Key; value : Value };
        #Get : { key : Key };
        #Delete : { key : Key };
    };

    type OperationStatus = {
        #Queued;
        #Processing;
        #Completed;
        #Failed;
        #Retrying;
    };

    type OperationResult = {
        #SetResult : Bool;
        #GetResult : ?Value;
        #DeleteResult : Bool;
        #Error : Text;
    };

    type OperationMetadata = {
        id : OperationId;
        operation : QueueOperation;
        status : OperationStatus;
        queuedAt : Timestamp;
        processingStartedAt : ?Timestamp;
        completedAt : ?Timestamp;
        result : ?OperationResult;
        errorMessage : ?Text;
        retryCount : Nat;
    };

    type QueueEntry = {
        metadata : OperationMetadata;
        position : Nat;
    };

    type OperationStatusInfo = {
        id : OperationId;
        status : OperationStatus;
        queuedAt : Timestamp;
        processingStartedAt : ?Timestamp;
        completedAt : ?Timestamp;
        result : ?OperationResult;
        errorMessage : ?Text;
        retryCount : Nat;
    };

    // ProcessQueue result types with batch processing safety metrics
    type ProcessQueueResult = {
        processedOperationIds : [OperationId];
        successfulOperations : [OperationId];
        failedOperations : [OperationId];
        operationStatuses : [(OperationId, OperationStatus)];
        errors : [(OperationId, Text)];
        processingStatistics : ProcessingStatistics;
        queueStateAfterProcessing : QueueStateInfo;
        cyclesConsumed : Nat;
        memoryUsed : Nat;
        batchTerminatedEarly : Bool;
        earlyTerminationReason : ?Text;
    };

    type ProcessingStatistics = {
        totalProcessed : Nat;
        successCount : Nat;
        failureCount : Nat;
        processingDurationMs : Nat;
    };

    type QueueStateInfo = {
        remainingQueueDepth : Nat;
        nextBatchAvailable : Bool;
    };

    // Task 6: Queue Management Types
    type QueueHealthStatus = {
        #Healthy;
        #Warning;
        #Critical;
        #Degraded;
    };

    type QueueHealthReport = {
        status : QueueHealthStatus;
        queueDepth : Nat;
        processingRate : Float;
        errorRate : Float;
        averageProcessingTime : Float;
        memoryUsage : Nat;
        cyclesBalance : Nat;
        lastHealthCheck : Timestamp;
        issues : [Text];
        recommendations : [Text];
    };

    type QueueMetrics = {
        totalOperationsQueued : Nat;
        totalOperationsCompleted : Nat;
        totalOperationsFailed : Nat;
        totalOperationsRetried : Nat;
        currentQueueDepth : Nat;
        averageQueueTime : Float;
        averageProcessingTime : Float;
        throughputPerMinute : Float;
        errorRate : Float;
        successRate : Float;
        peakQueueDepth : Nat;
        totalCyclesConsumed : Nat;
        totalMemoryUsed : Nat;
        uptime : Int;
        lastMetricsUpdate : Timestamp;
    };

    type MaintenanceOperation = {
        #PurgeCompleted;
        #PurgeFailed;
        #PurgeOld : { olderThanMs : Nat };
        #CompactQueue;
        #ResetStatistics;
        #OptimizeMemory;
    };

    type MaintenanceResult = {
        operation : MaintenanceOperation;
        success : Bool;
        itemsAffected : Nat;
        memoryFreed : Nat;
        executionTimeMs : Nat;
        message : Text;
    };

    type ConfigurationParameter = {
        #MaxQueueSize : Nat;
        #MaxBatchSize : Nat;
        #MinCyclesThreshold : Nat;
        #MaxMemoryUsageBytes : Nat;
        #MaxBatchProcessingTimeNs : Int;
        #MaxRetryAttempts : Nat;
        #HealthCheckIntervalMs : Nat;
        #MetricsCollectionEnabled : Bool;
    };

    // Subtask 5.4: Inter-canister call types and configuration
    type CacheCanisterInterface = actor {
        set : (Key, Value) -> async Bool;
        get : (Key) -> async ?Value;
        deleteEntry : (Key) -> async Bool;
    };

    // Configuration for cache canister communication
    private var CACHE_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"; // Default local canister ID
    private let INTER_CANISTER_CALL_TIMEOUT_NS : Nat64 = 30_000_000_000; // 30 seconds in nanoseconds
    private let MAX_RETRY_ATTEMPTS : Nat = 3;

    // Subtask 5.9: Batch processing safety configuration
    private let MAX_BATCH_PROCESSING_TIME_NS : Int = 5_000_000_000; // 5 seconds
    private let MIN_CYCLES_THRESHOLD : Nat = 1_000_000_000; // 1 billion cycles
    private let MAX_MEMORY_USAGE_BYTES : Nat = 1_000_000_000; // 1 GB
    private let DEFAULT_MAX_BATCH_SIZE : Nat = 50;
    private let MEMORY_CHECK_INTERVAL : Nat = 5; // Check memory every 5 operations

    // Maps and state
    transient let textMap = OrderedMap.Make<Text>(Text.compare);
    transient let natMap = OrderedMap.Make<Nat>(Nat.compare);

    var operationQueue : OrderedMap.Map<Nat, OperationMetadata> = natMap.empty();
    var operationLookup : OrderedMap.Map<OperationId, OperationMetadata> = textMap.empty();
    var nextQueuePosition : Nat = 0;
    var operationCounter : Nat = 0;
    var maxQueueSize : Nat = 1000;

    // Subtask 5.9: Configurable batch processing safety parameters
    var maxBatchSize : Nat = DEFAULT_MAX_BATCH_SIZE;
    var minCyclesThreshold : Nat = MIN_CYCLES_THRESHOLD;
    var maxMemoryUsageBytes : Nat = MAX_MEMORY_USAGE_BYTES;
    var maxBatchProcessingTimeNs : Int = MAX_BATCH_PROCESSING_TIME_NS;

    // Statistics
    var totalOperationsQueued : Nat = 0;
    var totalOperationsCompleted : Nat = 0;
    var totalOperationsFailed : Nat = 0;
    var currentQueueDepth : Nat = 0;

    // Task 6: Enhanced statistics and monitoring
    var totalOperationsRetried : Nat = 0;
    var peakQueueDepth : Nat = 0;
    var totalQueueTimeMs : Nat = 0;
    var totalProcessingTimeMs : Nat = 0;
    var totalCyclesConsumed : Nat = 0;
    var totalMemoryUsed : Nat = 0;
    var systemStartTime : Timestamp = Time.now();
    var lastHealthCheck : Timestamp = Time.now();
    var lastMetricsUpdate : Timestamp = Time.now();
    var healthCheckIntervalMs : Nat = 60000; // 1 minute
    var metricsCollectionEnabled : Bool = true;

    // Subtask 5.3: Processing state tracking for safe concurrent access
    var processingOperations : OrderedMap.Map<OperationId, Timestamp> = textMap.empty();
    var statusUpdateLock : Bool = false;

    // Subtask 5.4: Inter-canister call statistics and monitoring
    var totalInterCanisterCalls : Nat = 0;
    var successfulInterCanisterCalls : Nat = 0;
    var failedInterCanisterCalls : Nat = 0;
    var totalRetryAttempts : Nat = 0;

    // Subtask 5.9: Batch processing safety statistics
    var totalBatchesProcessed : Nat = 0;
    var totalEarlyTerminations : Nat = 0;
    var totalCyclesConsumedInBatches : Nat = 0;
    var totalMemoryUsedInBatches : Nat = 0;

    // Helper function to generate unique operation ID
    func generateOperationId() : OperationId {
        operationCounter += 1;
        let timestamp = Time.now();
        "op_" # Nat.toText(operationCounter) # "_" # Nat64.toText(Nat64.fromNat(Int.abs(timestamp)));
    };

    // Helper function to validate operation
    func validateOperation(operation : QueueOperation) : Result.Result<(), Text> {
        switch (operation) {
            case (#Set { key; value }) {
                if (Text.size(key) == 0) {
                    return #err("Key cannot be empty");
                };
                if (Text.size(value) == 0) {
                    return #err("Value cannot be empty");
                };
                if (Text.size(key) > 256) {
                    return #err("Key too long (max 256 characters)");
                };
                if (Text.size(value) > 1024) {
                    return #err("Value too long (max 1024 characters)");
                };
            };
            case (#Get { key }) {
                if (Text.size(key) == 0) {
                    return #err("Key cannot be empty");
                };
                if (Text.size(key) > 256) {
                    return #err("Key too long (max 256 characters)");
                };
            };
            case (#Delete { key }) {
                if (Text.size(key) == 0) {
                    return #err("Key cannot be empty");
                };
                if (Text.size(key) > 256) {
                    return #err("Key too long (max 256 characters)");
                };
            };
        };
        #ok(());
    };

    // Task 6: Helper function to update peak queue depth
    func updatePeakQueueDepth() {
        if (currentQueueDepth > peakQueueDepth) {
            peakQueueDepth := currentQueueDepth;
        };
    };

    // Task 6: Helper function to calculate processing rates
    func calculateProcessingRate() : Float {
        let uptime = Time.now() - systemStartTime;
        if (uptime > 0) {
            Float.fromInt(totalOperationsCompleted) / (Float.fromInt(Int.abs(uptime)) / 60_000_000_000.0); // operations per minute
        } else {
            0.0;
        };
    };

    // Task 6: Helper function to calculate error rate
    func calculateErrorRate() : Float {
        let totalProcessed = totalOperationsCompleted + totalOperationsFailed;
        if (totalProcessed > 0) {
            Float.fromInt(totalOperationsFailed) / Float.fromInt(totalProcessed);
        } else {
            0.0;
        };
    };

    // Task 6: Helper function to calculate success rate
    func calculateSuccessRate() : Float {
        let totalProcessed = totalOperationsCompleted + totalOperationsFailed;
        if (totalProcessed > 0) {
            Float.fromInt(totalOperationsCompleted) / Float.fromInt(totalProcessed);
        } else {
            0.0;
        };
    };

    // Task 6: Helper function to calculate average queue time
    func calculateAverageQueueTime() : Float {
        if (totalOperationsCompleted > 0) {
            Float.fromInt(totalQueueTimeMs) / Float.fromInt(totalOperationsCompleted);
        } else {
            0.0;
        };
    };

    // Task 6: Helper function to calculate average processing time
    func calculateAverageProcessingTime() : Float {
        if (totalOperationsCompleted > 0) {
            Float.fromInt(totalProcessingTimeMs) / Float.fromInt(totalOperationsCompleted);
        } else {
            0.0;
        };
    };

    // Subtask 5.4: Helper function to get cache canister actor reference
    func getCacheCanisterActor() : CacheCanisterInterface {
        actor(CACHE_CANISTER_ID) : CacheCanisterInterface;
    };

    // Subtask 5.4: Helper function to log inter-canister call attempts
    func logInterCanisterCall(operation : QueueOperation, success : Bool, errorMessage : ?Text) {
        totalInterCanisterCalls += 1;
        if (success) {
            successfulInterCanisterCalls += 1;
        } else {
            failedInterCanisterCalls += 1;
        };
        
        // Debug logging for development
        let operationType = switch (operation) {
            case (#Set { key; value }) { "SET " # key # "=" # value };
            case (#Get { key }) { "GET " # key };
            case (#Delete { key }) { "DELETE " # key };
        };
        
        if (success) {
            Debug.print("✓ Inter-canister call succeeded: " # operationType);
        } else {
            let error = switch (errorMessage) {
                case (?msg) { msg };
                case (null) { "Unknown error" };
            };
            Debug.print("✗ Inter-canister call failed: " # operationType # " - " # error);
        };
    };

    // Subtask 5.4: Core inter-canister call function with error handling and retry logic
    func executeInterCanisterCall(operation : QueueOperation, retryCount : Nat) : async OperationResult {
        let cacheActor = getCacheCanisterActor();
        
        try {
            switch (operation) {
                case (#Set { key; value }) {
                    Debug.print("Executing inter-canister SET call: " # key # " = " # value);
                    let result = await cacheActor.set(key, value);
                    logInterCanisterCall(operation, result, null);
                    #SetResult(result);
                };
                case (#Get { key }) {
                    Debug.print("Executing inter-canister GET call: " # key);
                    let result = await cacheActor.get(key);
                    logInterCanisterCall(operation, true, null);
                    #GetResult(result);
                };
                case (#Delete { key }) {
                    Debug.print("Executing inter-canister DELETE call: " # key);
                    let result = await cacheActor.deleteEntry(key);
                    logInterCanisterCall(operation, result, null);
                    #DeleteResult(result);
                };
            };
        } catch (error) {
            let errorMessage = "Inter-canister call failed";
            logInterCanisterCall(operation, false, ?errorMessage);
            
            // Implement retry logic for failed calls
            if (retryCount < MAX_RETRY_ATTEMPTS) {
                totalRetryAttempts += 1;
                totalOperationsRetried += 1;
                Debug.print("Retrying inter-canister call (attempt " # Nat.toText(retryCount + 1) # "/" # Nat.toText(MAX_RETRY_ATTEMPTS) # ")");
                
                // Exponential backoff delay could be implemented here
                // For now, we'll just retry immediately
                await executeInterCanisterCall(operation, retryCount + 1);
            } else {
                #Error(errorMessage);
            };
        };
    };

    // Subtask 5.9: Helper function to check batch processing safety conditions
    func checkBatchProcessingSafety(startTime : Timestamp, operationCount : Nat) : (Bool, ?Text) {
        let currentTime = Time.now();
        let elapsedTime = currentTime - startTime;
        let currentCycles = Cycles.balance();
        
        // Check processing time limit
        if (elapsedTime > maxBatchProcessingTimeNs) {
            return (false, ?"Processing time limit exceeded");
        };
        
        // Check cycles threshold
        if (currentCycles < minCyclesThreshold) {
            return (false, ?"Insufficient cycles remaining");
        };
        
        // Check memory usage periodically
        if (operationCount % MEMORY_CHECK_INTERVAL == 0) {
            let currentMemory = 0; // TODO: Use proper memory monitoring
            if (currentMemory > maxMemoryUsageBytes) {
                return (false, ?"Memory usage limit exceeded");
            };
        };
        
        (true, null);
    };

    // Subtask 5.3: Safe atomic operation status update with concurrency protection
    func safeUpdateOperationStatus(operationId : OperationId, newStatus : OperationStatus, result : ?OperationResult, errorMessage : ?Text) : Bool {
        // Check if operation is already being processed by another call
        switch (textMap.get(processingOperations, operationId)) {
            case (?_) {
                // Operation is already being processed, prevent race condition
                if (newStatus != #Processing) {
                    // Allow completion/failure updates for operations already in processing
                    ();
                } else {
                    // Prevent duplicate processing status updates
                    return false;
                };
            };
            case (null) {
                // Operation not currently being processed
                if (newStatus == #Processing) {
                    // Mark operation as being processed
                    processingOperations := textMap.put(processingOperations, operationId, Time.now());
                };
            };
        };

        switch (textMap.get(operationLookup, operationId)) {
            case (null) { return false }; // Operation not found
            case (?metadata) {
                // Validate status transition
                let validTransition = switch (metadata.status, newStatus) {
                    case (#Queued, #Processing) { true };
                    case (#Processing, #Completed) { true };
                    case (#Processing, #Failed) { true };
                    case (#Processing, #Retrying) { true };
                    case (#Failed, #Retrying) { true };
                    case (#Retrying, #Processing) { true };
                    case (_, _) { false }; // Invalid transition
                };

                if (not validTransition) {
                    return false;
                };

                let now = Time.now();
                let updatedMetadata : OperationMetadata = {
                    id = metadata.id;
                    operation = metadata.operation;
                    status = newStatus;
                    queuedAt = metadata.queuedAt;
                    processingStartedAt = switch (newStatus) {
                        case (#Processing) { 
                            switch (metadata.processingStartedAt) {
                                case (null) { ?now }; // First time processing
                                case (?existing) { ?existing }; // Keep existing timestamp
                            };
                        };
                        case (_) { metadata.processingStartedAt };
                    };
                    completedAt = switch (newStatus) {
                        case (#Completed or #Failed) { ?now };
                        case (_) { metadata.completedAt };
                    };
                    result = switch (result) {
                        case (?r) { ?r };
                        case (null) { metadata.result };
                    };
                    errorMessage = switch (errorMessage) {
                        case (?msg) { ?msg };
                        case (null) { metadata.errorMessage };
                    };
                    retryCount = switch (newStatus) {
                        case (#Retrying) { metadata.retryCount + 1 };
                        case (_) { metadata.retryCount };
                    };
                };

                // Task 6: Update metrics when operations complete
                if (metricsCollectionEnabled) {
                    switch (newStatus) {
                        case (#Completed or #Failed) {
                            // Calculate queue time
                            let queueTime = Int.abs(now - metadata.queuedAt) / 1_000_000; // Convert to milliseconds
                            totalQueueTimeMs += queueTime;
                            
                            // Calculate processing time
                            switch (metadata.processingStartedAt) {
                                case (?startTime) {
                                    let processingTime = Int.abs(now - startTime) / 1_000_000; // Convert to milliseconds
                                    totalProcessingTimeMs += processingTime;
                                };
                                case (null) {};
                            };
                        };
                        case (_) {};
                    };
                };

                // Atomic update of both lookup and queue maps
                operationLookup := textMap.put(operationLookup, operationId, updatedMetadata);

                // Update queue if operation is still in queue
                for ((position, queuedMetadata) in natMap.entries(operationQueue)) {
                    if (queuedMetadata.id == operationId) {
                        operationQueue := natMap.put(operationQueue, position, updatedMetadata);
                    };
                };

                // Remove from processing tracking when completed or failed
                switch (newStatus) {
                    case (#Completed or #Failed) {
                        processingOperations := textMap.delete(processingOperations, operationId);
                        // Update statistics
                        switch (newStatus) {
                            case (#Completed) {
                                totalOperationsCompleted += 1;
                            };
                            case (#Failed) {
                                totalOperationsFailed += 1;
                            };
                            case (_) {};
                        };
                    };
                    case (_) {};
                };

                true;
            };
        };
    };

    // Legacy wrapper for backward compatibility
    func updateOperationStatus(operationId : OperationId, newStatus : OperationStatus, result : ?OperationResult, errorMessage : ?Text) {
        let _ = safeUpdateOperationStatus(operationId, newStatus, result, errorMessage);
    };

    // Helper function to retrieve queued operations in FIFO order (Subtask 5.2)
    func retrieveQueuedOperations(batchSize : Nat) : [OperationMetadata] {
        // Validate batch size against configurable limit
        let safeBatchSize = if (batchSize > maxBatchSize) { maxBatchSize } else { batchSize };
        
        // Get all queue entries and sort by position (FIFO order)
        let allQueueEntries = Iter.toArray(natMap.entries(operationQueue));
        let sortedEntries = Array.sort<(Nat, OperationMetadata)>(allQueueEntries, func(a, b) {
            Nat.compare(a.0, b.0) // Sort by position (first element of tuple)
        });
        
        // Filter for only queued operations and respect batch size
        var selectedOperations : [OperationMetadata] = [];
        var count = 0;
        
        label batchLoop for ((position, metadata) in sortedEntries.vals()) {
            if (count >= safeBatchSize) {
                break batchLoop; // Respect batch size limit
            };
            
            // Only select operations with "Queued" status that are not already being processed
            if (metadata.status == #Queued and Option.isNull(textMap.get(processingOperations, metadata.id))) {
                selectedOperations := Array.append(selectedOperations, [metadata]);
                count += 1;
            };
        };
        
        selectedOperations;
    };

    // Helper function to remove processed operations from queue
    func removeOperationsFromQueue(operationIds : [OperationId]) {
        for (operationId in operationIds.vals()) {
            // Find and remove from queue by operation ID
            let queueEntries = Iter.toArray(natMap.entries(operationQueue));
            for ((position, metadata) in queueEntries.vals()) {
                if (metadata.id == operationId) {
                    operationQueue := natMap.delete(operationQueue, position);
                    currentQueueDepth -= 1;
                };
            };
        };
    };

    // Subtask 5.4: Updated cache operation processing using real inter-canister calls
    func processCacheOperation(operation : QueueOperation) : async OperationResult {
        Debug.print("Processing cache operation via inter-canister call");
        await executeInterCanisterCall(operation, 0);
    };

    // Public method to queue an operation
    public func queueOperation(operation : QueueOperation) : async Result.Result<OperationId, Text> {
        // Validate operation
        switch (validateOperation(operation)) {
            case (#err(msg)) { return #err(msg) };
            case (#ok()) {};
        };

        // Check queue capacity
        if (currentQueueDepth >= maxQueueSize) {
            return #err("Queue is full. Maximum capacity reached.");
        };

        // Generate unique operation ID
        let operationId = generateOperationId();
        let now = Time.now();

        // Create operation metadata
        let metadata : OperationMetadata = {
            id = operationId;
            operation = operation;
            status = #Queued;
            queuedAt = now;
            processingStartedAt = null;
            completedAt = null;
            result = null;
            errorMessage = null;
            retryCount = 0;
        };

        // Add to queue and lookup
        operationQueue := natMap.put(operationQueue, nextQueuePosition, metadata);
        operationLookup := textMap.put(operationLookup, operationId, metadata);

        // Update counters
        nextQueuePosition += 1;
        currentQueueDepth += 1;
        totalOperationsQueued += 1;

        // Task 6: Update peak queue depth
        updatePeakQueueDepth();

        #ok(operationId);
    };

    // Main processQueue method implementing subtasks 5.2, 5.3, 5.4, and 5.9
    public func processQueue(batchSize : Nat) : async ProcessQueueResult {
        let startTime = Time.now();
        let initialCycles = Cycles.balance();
        let initialMemory = 0; // TODO: Use proper memory monitoring

        // Increment batch processing counter
        totalBatchesProcessed += 1;

        // Handle empty queue scenario
        if (currentQueueDepth == 0) {
            return {
                processedOperationIds = [];
                successfulOperations = [];
                failedOperations = [];
                operationStatuses = [];
                errors = [];
                processingStatistics = {
                    totalProcessed = 0;
                    successCount = 0;
                    failureCount = 0;
                    processingDurationMs = 0;
                };
                queueStateAfterProcessing = {
                    remainingQueueDepth = 0;
                    nextBatchAvailable = false;
                };
                cyclesConsumed = 0;
                memoryUsed = 0;
                batchTerminatedEarly = false;
                earlyTerminationReason = null;
            };
        };

        // Retrieve queued operations in FIFO order (Subtask 5.2 implementation)
        let operationsToProcess = retrieveQueuedOperations(batchSize);

        // Handle case where no queued operations are available
        if (operationsToProcess.size() == 0) {
            return {
                processedOperationIds = [];
                successfulOperations = [];
                failedOperations = [];
                operationStatuses = [];
                errors = [];
                processingStatistics = {
                    totalProcessed = 0;
                    successCount = 0;
                    failureCount = 0;
                    processingDurationMs = Nat64.toNat(Nat64.fromNat(Int.abs(Time.now() - startTime))) / 1000000;
                };
                queueStateAfterProcessing = {
                    remainingQueueDepth = currentQueueDepth;
                    nextBatchAvailable = false;
                };
                cyclesConsumed = 0;
                memoryUsed = 0;
                batchTerminatedEarly = false;
                earlyTerminationReason = null;
            };
        };

        // Process each operation with safe status updates and batch processing safety (Subtasks 5.3, 5.4, and 5.9)
        var processedIds : [OperationId] = [];
        var successfulOps : [OperationId] = [];
        var failedOps : [OperationId] = [];
        var operationStatuses : [(OperationId, OperationStatus)] = [];
        var errors : [(OperationId, Text)] = [];
        var batchTerminatedEarly = false;
        var earlyTerminationReason : ?Text = null;
        var operationCount = 0;

        label processLoop for (metadata in operationsToProcess.vals()) {
            operationCount += 1;

            // Subtask 5.9: Check batch processing safety conditions
            let (safetyCheck, safetyReason) = checkBatchProcessingSafety(startTime, operationCount);
            if (not safetyCheck) {
                Debug.print("Terminating batch early: " # Option.get(safetyReason, "Unknown reason"));
                batchTerminatedEarly := true;
                earlyTerminationReason := safetyReason;
                totalEarlyTerminations += 1;
                break processLoop;
            };

            // Subtask 5.3: Safe atomic status update to processing with timestamp tracking
            let statusUpdateSuccess = safeUpdateOperationStatus(metadata.id, #Processing, null, null);
            
            if (not statusUpdateSuccess) {
                // Status update failed (likely due to concurrent processing), skip this operation
                errors := Array.append(errors, [(metadata.id, "Concurrent processing detected, operation skipped")]);
                continue processLoop;
            };
            
            // Subtask 5.4: Process the operation using real inter-canister calls
            let result = await processCacheOperation(metadata.operation);
            
            // Handle result with safe status updates
            switch (result) {
                case (#SetResult(success) or #DeleteResult(success)) {
                    if (success) {
                        let _ = safeUpdateOperationStatus(metadata.id, #Completed, ?result, null);
                        successfulOps := Array.append(successfulOps, [metadata.id]);
                        operationStatuses := Array.append(operationStatuses, [(metadata.id, #Completed)]);
                    } else {
                        let _ = safeUpdateOperationStatus(metadata.id, #Failed, ?result, ?"Operation returned false");
                        failedOps := Array.append(failedOps, [metadata.id]);
                        operationStatuses := Array.append(operationStatuses, [(metadata.id, #Failed)]);
                        errors := Array.append(errors, [(metadata.id, "Operation returned false")]);
                    };
                };
                case (#GetResult(_)) {
                    let _ = safeUpdateOperationStatus(metadata.id, #Completed, ?result, null);
                    successfulOps := Array.append(successfulOps, [metadata.id]);
                    operationStatuses := Array.append(operationStatuses, [(metadata.id, #Completed)]);
                };
                case (#Error(errorMsg)) {
                    let _ = safeUpdateOperationStatus(metadata.id, #Failed, ?result, ?errorMsg);
                    failedOps := Array.append(failedOps, [metadata.id]);
                    operationStatuses := Array.append(operationStatuses, [(metadata.id, #Failed)]);
                    errors := Array.append(errors, [(metadata.id, errorMsg)]);
                };
            };
            
            processedIds := Array.append(processedIds, [metadata.id]);
        };

        // Remove processed operations from queue (partial batch completion handling)
        removeOperationsFromQueue(processedIds);

        // Calculate final statistics
        let endTime = Time.now();
        let processingDuration = Nat64.toNat(Nat64.fromNat(Int.abs(endTime - startTime))) / 1000000; // Convert to milliseconds
        let cyclesConsumed = if (initialCycles >= Cycles.balance()) {
            initialCycles - Cycles.balance();
        } else {
            0; // Handle potential overflow
        };
        let memoryUsed = if (0 >= initialMemory) {
            0 - initialMemory;
        } else {
            0; // Handle potential underflow
        };

        // Update batch processing statistics
        totalCyclesConsumedInBatches += cyclesConsumed;
        totalMemoryUsedInBatches += memoryUsed;
        totalCyclesConsumed += cyclesConsumed;
        totalMemoryUsed += memoryUsed;

        // Check if more operations are available for next batch
        let remainingQueued = Array.filter<(Nat, OperationMetadata)>(
            Iter.toArray(natMap.entries(operationQueue)),
            func((_, metadata)) { metadata.status == #Queued }
        );

        {
            processedOperationIds = processedIds;
            successfulOperations = successfulOps;
            failedOperations = failedOps;
            operationStatuses = operationStatuses;
            errors = errors;
            processingStatistics = {
                totalProcessed = processedIds.size();
                successCount = successfulOps.size();
                failureCount = failedOps.size();
                processingDurationMs = processingDuration;
            };
            queueStateAfterProcessing = {
                remainingQueueDepth = remainingQueued.size();
                nextBatchAvailable = remainingQueued.size() > 0;
            };
            cyclesConsumed = cyclesConsumed;
            memoryUsed = memoryUsed;
            batchTerminatedEarly = batchTerminatedEarly;
            earlyTerminationReason = earlyTerminationReason;
        };
    };

    // Task 6: Queue Health Check Implementation
    public query func performHealthCheck() : async QueueHealthReport {
        let now = Time.now();
        let currentCycles = Cycles.balance();
        let currentMemory = 0; // TODO: Use proper memory monitoring
        let processingRate = calculateProcessingRate();
        let errorRate = calculateErrorRate();
        let avgProcessingTime = calculateAverageProcessingTime();
        
        var status : QueueHealthStatus = #Healthy;
        var issues : [Text] = [];
        var recommendations : [Text] = [];

        // Check queue depth
        if (currentQueueDepth > (maxQueueSize * 80 / 100)) {
            status := #Warning;
            issues := Array.append(issues, ["Queue depth is at " # Nat.toText(currentQueueDepth) # "/" # Nat.toText(maxQueueSize)]);
            recommendations := Array.append(recommendations, ["Consider increasing processing rate or queue capacity"]);
        };

        if (currentQueueDepth >= maxQueueSize) {
            status := #Critical;
            issues := Array.append(issues, ["Queue is at maximum capacity"]);
            recommendations := Array.append(recommendations, ["Immediate action required: increase processing or clear queue"]);
        };

        // Check error rate
        if (errorRate > 0.1) { // 10% error rate
            status := #Warning;
            issues := Array.append(issues, ["High error rate: " # Float.toText(errorRate * 100.0) # "%"]);
            recommendations := Array.append(recommendations, ["Investigate error causes and improve error handling"]);
        };

        if (errorRate > 0.25) { // 25% error rate
            status := #Critical;
            issues := Array.append(issues, ["Critical error rate: " # Float.toText(errorRate * 100.0) # "%"]);
            recommendations := Array.append(recommendations, ["System requires immediate attention"]);
        };

        // Check cycles
        if (currentCycles < minCyclesThreshold * 2) {
            status := #Warning;
            issues := Array.append(issues, ["Low cycles balance: " # Nat.toText(currentCycles)]);
            recommendations := Array.append(recommendations, ["Top up cycles soon"]);
        };

        if (currentCycles < minCyclesThreshold) {
            status := #Critical;
            issues := Array.append(issues, ["Critical cycles balance: " # Nat.toText(currentCycles)]);
            recommendations := Array.append(recommendations, ["Immediate cycles top-up required"]);
        };

        // Check memory usage
        if (currentMemory > (maxMemoryUsageBytes * 80 / 100)) {
            status := #Warning;
            issues := Array.append(issues, ["High memory usage: " # Nat.toText(currentMemory) # " bytes"]);
            recommendations := Array.append(recommendations, ["Consider memory optimization or cleanup"]);
        };

        if (currentMemory > maxMemoryUsageBytes) {
            status := #Critical;
            issues := Array.append(issues, ["Memory usage exceeds limit: " # Nat.toText(currentMemory) # " bytes"]);
            recommendations := Array.append(recommendations, ["Immediate memory cleanup required"]);
        };

        // Check processing operations
        let processingCount = textMap.size(processingOperations);
        if (processingCount > maxBatchSize * 2) {
            status := #Degraded;
            issues := Array.append(issues, ["Too many operations in processing state: " # Nat.toText(processingCount)]);
            recommendations := Array.append(recommendations, ["Check for stuck operations or reduce batch size"]);
        };

        lastHealthCheck := now;

        {
            status = status;
            queueDepth = currentQueueDepth;
            processingRate = processingRate;
            errorRate = errorRate;
            averageProcessingTime = avgProcessingTime;
            memoryUsage = currentMemory;
            cyclesBalance = currentCycles;
            lastHealthCheck = now;
            issues = issues;
            recommendations = recommendations;
        };
    };

    // Task 6: Comprehensive Queue Metrics
    public query func getQueueMetrics() : async QueueMetrics {
        let now = Time.now();
        let uptime = now - systemStartTime;
        let processingRate = calculateProcessingRate();
        let errorRate = calculateErrorRate();
        let successRate = calculateSuccessRate();
        let avgQueueTime = calculateAverageQueueTime();
        let avgProcessingTime = calculateAverageProcessingTime();

        lastMetricsUpdate := now;

        {
            totalOperationsQueued = totalOperationsQueued;
            totalOperationsCompleted = totalOperationsCompleted;
            totalOperationsFailed = totalOperationsFailed;
            totalOperationsRetried = totalOperationsRetried;
            currentQueueDepth = currentQueueDepth;
            averageQueueTime = avgQueueTime;
            averageProcessingTime = avgProcessingTime;
            throughputPerMinute = processingRate;
            errorRate = errorRate;
            successRate = successRate;
            peakQueueDepth = peakQueueDepth;
            totalCyclesConsumed = totalCyclesConsumed;
            totalMemoryUsed = totalMemoryUsed;
            uptime = Int.abs(uptime);
            lastMetricsUpdate = now;
        };
    };

    // Task 6: Maintenance Operations
    public shared ({ caller }) func performMaintenance(operation : MaintenanceOperation) : async MaintenanceResult {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can perform maintenance operations");
        };

        let startTime = Time.now();
        let initialMemory = 0; // TODO: Use proper memory monitoring
        var itemsAffected = 0;
        var success = true;
        var message = "";

        switch (operation) {
            case (#PurgeCompleted) {
                let completedIds = Array.mapFilter<(OperationId, OperationMetadata), OperationId>(
                    Iter.toArray(textMap.entries(operationLookup)),
                    func((id, metadata)) {
                        if (metadata.status == #Completed) {
                            itemsAffected += 1;
                            ?id;
                        } else {
                            null;
                        };
                    }
                );

                for (id in completedIds.vals()) {
                    operationLookup := textMap.delete(operationLookup, id);
                    processingOperations := textMap.delete(processingOperations, id);
                };

                message := "Purged " # Nat.toText(itemsAffected) # " completed operations";
            };

            case (#PurgeFailed) {
                let failedIds = Array.mapFilter<(OperationId, OperationMetadata), OperationId>(
                    Iter.toArray(textMap.entries(operationLookup)),
                    func((id, metadata)) {
                        if (metadata.status == #Failed) {
                            itemsAffected += 1;
                            ?id;
                        } else {
                            null;
                        };
                    }
                );

                for (id in failedIds.vals()) {
                    operationLookup := textMap.delete(operationLookup, id);
                    processingOperations := textMap.delete(processingOperations, id);
                };

                message := "Purged " # Nat.toText(itemsAffected) # " failed operations";
            };

            case (#PurgeOld { olderThanMs }) {
                let cutoffTime = Time.now() - (olderThanMs * 1_000_000); // Convert ms to nanoseconds
                let oldIds = Array.mapFilter<(OperationId, OperationMetadata), OperationId>(
                    Iter.toArray(textMap.entries(operationLookup)),
                    func((id, metadata)) {
                        if (metadata.queuedAt < cutoffTime and (metadata.status == #Completed or metadata.status == #Failed)) {
                            itemsAffected += 1;
                            ?id;
                        } else {
                            null;
                        };
                    }
                );

                for (id in oldIds.vals()) {
                    operationLookup := textMap.delete(operationLookup, id);
                    processingOperations := textMap.delete(processingOperations, id);
                };

                message := "Purged " # Nat.toText(itemsAffected) # " operations older than " # Nat.toText(olderThanMs) # "ms";
            };

            case (#CompactQueue) {
                // Rebuild queue with consecutive positions
                let activeOperations = Array.filter<(Nat, OperationMetadata)>(
                    Iter.toArray(natMap.entries(operationQueue)),
                    func((_, metadata)) { metadata.status == #Queued or metadata.status == #Processing }
                );

                operationQueue := natMap.empty();
                var newPosition = 0;

                for ((_, metadata) in activeOperations.vals()) {
                    operationQueue := natMap.put(operationQueue, newPosition, metadata);
                    newPosition += 1;
                };

                nextQueuePosition := newPosition;
                itemsAffected := activeOperations.size();
                message := "Compacted queue with " # Nat.toText(itemsAffected) # " active operations";
            };

            case (#ResetStatistics) {
                totalOperationsQueued := 0;
                totalOperationsCompleted := 0;
                totalOperationsFailed := 0;
                totalOperationsRetried := 0;
                peakQueueDepth := currentQueueDepth;
                totalQueueTimeMs := 0;
                totalProcessingTimeMs := 0;
                totalCyclesConsumed := 0;
                totalMemoryUsed := 0;
                totalInterCanisterCalls := 0;
                successfulInterCanisterCalls := 0;
                failedInterCanisterCalls := 0;
                totalRetryAttempts := 0;
                totalBatchesProcessed := 0;
                totalEarlyTerminations := 0;
                totalCyclesConsumedInBatches := 0;
                totalMemoryUsedInBatches := 0;
                systemStartTime := Time.now();

                message := "All statistics have been reset";
            };

            case (#OptimizeMemory) {
                // Clean up stale processing operations
                let staleProcessingIds = Array.mapFilter<(OperationId, Timestamp), OperationId>(
                    Iter.toArray(textMap.entries(processingOperations)),
                    func((id, timestamp)) {
                        let age = Time.now() - timestamp;
                        if (age > 3600_000_000_000) { // 1 hour in nanoseconds
                            itemsAffected += 1;
                            ?id;
                        } else {
                            null;
                        };
                    }
                );

                for (id in staleProcessingIds.vals()) {
                    processingOperations := textMap.delete(processingOperations, id);
                };

                message := "Cleaned up " # Nat.toText(itemsAffected) # " stale processing operations";
            };
        };

        let endTime = Time.now();
        let executionTime = Nat64.toNat(Nat64.fromNat(Int.abs(endTime - startTime))) / 1_000_000; // Convert to milliseconds
        let memoryFreed = if (initialMemory >= 0) {
            initialMemory - 0;
        } else {
            0;
        };

        {
            operation = operation;
            success = success;
            itemsAffected = itemsAffected;
            memoryFreed = memoryFreed;
            executionTimeMs = executionTime;
            message = message;
        };
    };

    // Task 6: Configuration Management
    public shared ({ caller }) func updateConfiguration(parameter : ConfigurationParameter) : async Bool {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can update configuration");
        };

        switch (parameter) {
            case (#MaxQueueSize(size)) {
                if (size > 0 and size <= 10000) {
                    maxQueueSize := size;
                    Debug.print("Updated maxQueueSize to " # Nat.toText(size));
                    true;
                } else {
                    false;
                };
            };
            case (#MaxBatchSize(size)) {
                if (size > 0 and size <= 1000) {
                    maxBatchSize := size;
                    Debug.print("Updated maxBatchSize to " # Nat.toText(size));
                    true;
                } else {
                    false;
                };
            };
            case (#MinCyclesThreshold(threshold)) {
                if (threshold >= 100_000_000) {
                    minCyclesThreshold := threshold;
                    Debug.print("Updated minCyclesThreshold to " # Nat.toText(threshold));
                    true;
                } else {
                    false;
                };
            };
            case (#MaxMemoryUsageBytes(limit)) {
                if (limit >= 100_000_000 and limit <= 4_000_000_000) {
                    maxMemoryUsageBytes := limit;
                    Debug.print("Updated maxMemoryUsageBytes to " # Nat.toText(limit));
                    true;
                } else {
                    false;
                };
            };
            case (#MaxBatchProcessingTimeNs(timeLimit)) {
                if (timeLimit >= 1_000_000_000 and timeLimit <= 60_000_000_000) {
                    maxBatchProcessingTimeNs := timeLimit;
                    Debug.print("Updated maxBatchProcessingTimeNs to " # Int.toText(timeLimit));
                    true;
                } else {
                    false;
                };
            };
            case (#MaxRetryAttempts(attempts)) {
                // This would require updating the constant, for now just log
                Debug.print("MaxRetryAttempts configuration requested: " # Nat.toText(attempts));
                true;
            };
            case (#HealthCheckIntervalMs(interval)) {
                if (interval >= 1000 and interval <= 3600000) {
                    healthCheckIntervalMs := interval;
                    Debug.print("Updated healthCheckIntervalMs to " # Nat.toText(interval));
                    true;
                } else {
                    false;
                };
            };
            case (#MetricsCollectionEnabled(enabled)) {
                metricsCollectionEnabled := enabled;
                Debug.print("Updated metricsCollectionEnabled to " # Bool.toText(enabled));
                true;
            };
        };
    };

    // Task 6: Get Current Configuration
    public query ({ caller }) func getConfiguration() : async {
        maxQueueSize : Nat;
        maxBatchSize : Nat;
        minCyclesThreshold : Nat;
        maxMemoryUsageBytes : Nat;
        maxBatchProcessingTimeNs : Int;
        healthCheckIntervalMs : Nat;
        metricsCollectionEnabled : Bool;
    } {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can view configuration");
        };

        {
            maxQueueSize = maxQueueSize;
            maxBatchSize = maxBatchSize;
            minCyclesThreshold = minCyclesThreshold;
            maxMemoryUsageBytes = maxMemoryUsageBytes;
            maxBatchProcessingTimeNs = maxBatchProcessingTimeNs;
            healthCheckIntervalMs = healthCheckIntervalMs;
            metricsCollectionEnabled = metricsCollectionEnabled;
        };
    };

    // Public method to get operation status
    public query func getOperationStatus(operationId : OperationId) : async ?OperationStatusInfo {
        switch (textMap.get(operationLookup, operationId)) {
            case (null) { null };
            case (?metadata) {
                ?{
                    id = metadata.id;
                    status = metadata.status;
                    queuedAt = metadata.queuedAt;
                    processingStartedAt = metadata.processingStartedAt;
                    completedAt = metadata.completedAt;
                    result = metadata.result;
                    errorMessage = metadata.errorMessage;
                    retryCount = metadata.retryCount;
                };
            };
        };
    };

    // Public method to get multiple operation statuses
    public query func getOperationStatuses(operationIds : [OperationId]) : async [?OperationStatusInfo] {
        Array.map<OperationId, ?OperationStatusInfo>(operationIds, func(id) {
            switch (textMap.get(operationLookup, id)) {
                case (null) { null };
                case (?metadata) {
                    ?{
                        id = metadata.id;
                        status = metadata.status;
                        queuedAt = metadata.queuedAt;
                        processingStartedAt = metadata.processingStartedAt;
                        completedAt = metadata.completedAt;
                        result = metadata.result;
                        errorMessage = metadata.errorMessage;
                        retryCount = metadata.retryCount;
                    };
                };
            };
        });
    };

    // Public method to get queue statistics
    public query func getQueueStatistics() : async {
        totalOperationsQueued : Nat;
        totalOperationsCompleted : Nat;
        totalOperationsFailed : Nat;
        currentQueueDepth : Nat;
        maxQueueSize : Nat;
        nextQueuePosition : Nat;
        currentlyProcessing : Nat;
    } {
        {
            totalOperationsQueued = totalOperationsQueued;
            totalOperationsCompleted = totalOperationsCompleted;
            totalOperationsFailed = totalOperationsFailed;
            currentQueueDepth = currentQueueDepth;
            maxQueueSize = maxQueueSize;
            nextQueuePosition = nextQueuePosition;
            currentlyProcessing = textMap.size(processingOperations);
        };
    };

    // Subtask 5.4: Public method to get inter-canister call statistics
    public query func getInterCanisterCallStatistics() : async {
        totalInterCanisterCalls : Nat;
        successfulInterCanisterCalls : Nat;
        failedInterCanisterCalls : Nat;
        totalRetryAttempts : Nat;
        successRate : Float;
    } {
        let successRate = if (totalInterCanisterCalls > 0) {
            Float.fromInt(successfulInterCanisterCalls) / Float.fromInt(totalInterCanisterCalls)
        } else {
            0.0
        };
        
        {
            totalInterCanisterCalls = totalInterCanisterCalls;
            successfulInterCanisterCalls = successfulInterCanisterCalls;
            failedInterCanisterCalls = failedInterCanisterCalls;
            totalRetryAttempts = totalRetryAttempts;
            successRate = successRate;
        };
    };

    // Subtask 5.9: Public method to get batch processing safety statistics
    public query func getBatchProcessingStatistics() : async {
        totalBatchesProcessed : Nat;
        totalEarlyTerminations : Nat;
        totalCyclesConsumedInBatches : Nat;
        totalMemoryUsedInBatches : Nat;
        averageCyclesPerBatch : Float;
        averageMemoryPerBatch : Float;
        earlyTerminationRate : Float;
        currentBatchSafetyLimits : {
            maxBatchSize : Nat;
            minCyclesThreshold : Nat;
            maxMemoryUsageBytes : Nat;
            maxBatchProcessingTimeNs : Int;
        };
    } {
        let averageCyclesPerBatch = if (totalBatchesProcessed > 0) {
            Float.fromInt(totalCyclesConsumedInBatches) / Float.fromInt(totalBatchesProcessed)
        } else {
            0.0
        };
        
        let averageMemoryPerBatch = if (totalBatchesProcessed > 0) {
            Float.fromInt(totalMemoryUsedInBatches) / Float.fromInt(totalBatchesProcessed)
        } else {
            0.0
        };
        
        let earlyTerminationRate = if (totalBatchesProcessed > 0) {
            Float.fromInt(totalEarlyTerminations) / Float.fromInt(totalBatchesProcessed)
        } else {
            0.0
        };
        
        {
            totalBatchesProcessed = totalBatchesProcessed;
            totalEarlyTerminations = totalEarlyTerminations;
            totalCyclesConsumedInBatches = totalCyclesConsumedInBatches;
            totalMemoryUsedInBatches = totalMemoryUsedInBatches;
            averageCyclesPerBatch = averageCyclesPerBatch;
            averageMemoryPerBatch = averageMemoryPerBatch;
            earlyTerminationRate = earlyTerminationRate;
            currentBatchSafetyLimits = {
                maxBatchSize = maxBatchSize;
                minCyclesThreshold = minCyclesThreshold;
                maxMemoryUsageBytes = maxMemoryUsageBytes;
                maxBatchProcessingTimeNs = maxBatchProcessingTimeNs;
            };
        };
    };

    // New method to reset inter-canister call statistics
    public shared ({ caller }) func resetInterCanisterCallStatistics() : async Bool {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can reset statistics");
        };

        totalInterCanisterCalls := 0;
        successfulInterCanisterCalls := 0;
        failedInterCanisterCalls := 0;
        totalRetryAttempts := 0;
        
        Debug.print("Inter-canister call statistics have been reset to zero");
        true;
    };

    // Subtask 5.9: Public method to reset batch processing statistics
    public shared ({ caller }) func resetBatchProcessingStatistics() : async Bool {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can reset statistics");
        };

        totalBatchesProcessed := 0;
        totalEarlyTerminations := 0;
        totalCyclesConsumedInBatches := 0;
        totalMemoryUsedInBatches := 0;
        
        Debug.print("Batch processing statistics have been reset to zero");
        true;
    };

    // Public method to get current queue state
    public query func getQueueState() : async [(Nat, OperationStatusInfo)] {
        let entries = natMap.entries(operationQueue);
        Array.map<(Nat, OperationMetadata), (Nat, OperationStatusInfo)>(Iter.toArray(entries), func((position, metadata)) {
            (position, {
                id = metadata.id;
                status = metadata.status;
                queuedAt = metadata.queuedAt;
                processingStartedAt = metadata.processingStartedAt;
                completedAt = metadata.completedAt;
                result = metadata.result;
                errorMessage = metadata.errorMessage;
                retryCount = metadata.retryCount;
            });
        });
    };

    // Public method to clear completed operations from history
    public shared ({ caller }) func clearCompletedOperations() : async Nat {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can clear operations");
        };

        var clearedCount = 0;
        let completedIds = Array.mapFilter<(OperationId, OperationMetadata), OperationId>(
            Iter.toArray(textMap.entries(operationLookup)),
            func((id, metadata)) {
                if (metadata.status == #Completed or metadata.status == #Failed) {
                    clearedCount += 1;
                    ?id;
                } else {
                    null;
                };
            }
        );

        for (id in completedIds.vals()) {
            operationLookup := textMap.delete(operationLookup, id);
            // Also clean up any stale processing entries
            processingOperations := textMap.delete(processingOperations, id);
        };

        clearedCount;
    };

    // Simulate operation processing (for demonstration purposes - now deprecated in favor of real inter-canister calls)
    public func simulateProcessOperation(operationId : OperationId) : async Bool {
        switch (textMap.get(operationLookup, operationId)) {
            case (null) { false };
            case (?metadata) {
                if (metadata.status != #Queued) {
                    return false;
                };

                // Safe status update to processing
                let statusUpdateSuccess = safeUpdateOperationStatus(operationId, #Processing, null, null);
                if (not statusUpdateSuccess) {
                    return false;
                };

                // Use real inter-canister call instead of simulation
                let result = await processCacheOperation(metadata.operation);
                
                // Safe status update to completed with result
                let _ = safeUpdateOperationStatus(operationId, #Completed, ?result, null);

                // Remove from queue
                for ((position, queuedMetadata) in natMap.entries(operationQueue)) {
                    if (queuedMetadata.id == operationId) {
                        operationQueue := natMap.delete(operationQueue, position);
                        currentQueueDepth -= 1;
                    };
                };

                true;
            };
        };
    };

    // Subtask 5.3: Public method to get currently processing operations (for monitoring)
    public query func getCurrentlyProcessingOperations() : async [(OperationId, Timestamp)] {
        Iter.toArray(textMap.entries(processingOperations));
    };

    // Subtask 5.4: Public method to configure cache canister ID (for testing and deployment flexibility)
    public shared ({ caller }) func configureCacheCanister(canisterId : Text) : async Bool {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can configure cache canister");
        };

        // Update the CACHE_CANISTER_ID with the provided canister ID
        CACHE_CANISTER_ID := canisterId;
        Debug.print("Cache canister configured: " # canisterId);
        true;
    };

    // Subtask 5.9: Public method to configure batch processing safety parameters
    public shared ({ caller }) func configureBatchProcessingSafety(
        newMaxBatchSize : ?Nat,
        newMinCyclesThreshold : ?Nat,
        newMaxMemoryUsageBytes : ?Nat,
        newMaxBatchProcessingTimeNs : ?Int
    ) : async Bool {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can configure batch processing safety");
        };

        // Update batch size with validation
        switch (newMaxBatchSize) {
            case (?size) {
                maxBatchSize := if (size > DEFAULT_MAX_BATCH_SIZE) {
                    DEFAULT_MAX_BATCH_SIZE; // Cap at default maximum
                } else if (size < 1) {
                    1; // Minimum batch size of 1
                } else {
                    size;
                };
            };
            case (null) {};
        };

        // Update cycles threshold with validation
        switch (newMinCyclesThreshold) {
            case (?threshold) {
                minCyclesThreshold := if (threshold < 100_000_000) {
                    100_000_000; // Minimum 100M cycles
                } else {
                    threshold;
                };
            };
            case (null) {};
        };

        // Update memory usage limit with validation
        switch (newMaxMemoryUsageBytes) {
            case (?memLimit) {
                maxMemoryUsageBytes := if (memLimit > 2_000_000_000) {
                    2_000_000_000; // Cap at 2GB
                } else if (memLimit < 100_000_000) {
                    100_000_000; // Minimum 100MB
                } else {
                    memLimit;
                };
            };
            case (null) {};
        };

        // Update processing time limit with validation
        switch (newMaxBatchProcessingTimeNs) {
            case (?timeLimit) {
                maxBatchProcessingTimeNs := if (timeLimit > 30_000_000_000) {
                    30_000_000_000; // Cap at 30 seconds
                } else if (timeLimit < 1_000_000_000) {
                    1_000_000_000; // Minimum 1 second
                } else {
                    timeLimit;
                };
            };
            case (null) {};
        };

        Debug.print("Batch processing safety configuration updated: " #
            "maxBatchSize=" # Nat.toText(maxBatchSize) #
            ", minCyclesThreshold=" # Nat.toText(minCyclesThreshold) #
            ", maxMemoryUsageBytes=" # Nat.toText(maxMemoryUsageBytes) #
            ", maxBatchProcessingTimeNs=" # Int.toText(maxBatchProcessingTimeNs));
        
        true;
    };

    // Authentication functions
    public shared ({ caller }) func initializeAuth() : async () {
        AdminSystem.initializeAuth(adminState, caller);
    };

    public query ({ caller }) func isCurrentUserAdmin() : async Bool {
        AdminSystem.isCurrentUserAdmin(adminState, caller);
    };

    // User profile management
    public type UserProfile = {
        name : Text;
    };

    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    var userProfiles = principalMap.empty<UserProfile>();

    public query ({ caller }) func getUserProfile() : async ?UserProfile {
        principalMap.get(userProfiles, caller);
    };

    public shared ({ caller }) func saveUserProfile(profile: UserProfile) : async () {
        userProfiles := principalMap.put(userProfiles, caller, profile);
    };
};
