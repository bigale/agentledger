import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Time "mo:base/Time";
import AdminSystem "auth-single-user/management";
import Principal "mo:base/Principal";

persistent actor {
    // Initialize the admin system state
    let adminState = AdminSystem.initState();

    type NodeId = Nat;
    type Key = Text;
    type Value = Text;

    type NodeStatus = {
        #Healthy;
        #Failed;
        #Recovering;
    };

    type CacheEntry = {
        value : Value;
        primaryNode : NodeId;
        replicaNode : NodeId;
    };

    transient let textMap = OrderedMap.Make<Text>(Text.compare);
    transient let natMap = OrderedMap.Make<Nat>(Nat.compare);

    var cache : OrderedMap.Map<Key, CacheEntry> = textMap.empty();
    var nodeStatuses : OrderedMap.Map<NodeId, NodeStatus> = natMap.empty();
    var nodeEntries : OrderedMap.Map<NodeId, [Key]> = natMap.empty();

    let numNodes : Nat = 6;

    // Initialize node statuses and entries
    for (i in Iter.range(0, numNodes - 1)) {
        nodeStatuses := natMap.put(nodeStatuses, i, #Healthy);
        nodeEntries := natMap.put(nodeEntries, i, []);
    };

    // Helper function to get healthy nodes
    func getHealthyNodes() : [NodeId] {
        var healthyNodes : [NodeId] = [];
        for ((id, status) in natMap.entries(nodeStatuses)) {
            if (status == #Healthy) {
                healthyNodes := Array.append(healthyNodes, [id]);
            };
        };
        healthyNodes;
    };

    // Helper function to find new replica node
    func findNewReplica(primaryNode : NodeId) : NodeId {
        let healthyNodes = getHealthyNodes();
        if (healthyNodes.size() == 1) {
            return healthyNodes[0];
        };
        for (node in healthyNodes.vals()) {
            if (node != primaryNode) {
                return node;
            };
        };
        primaryNode // Fallback to primary if no other healthy nodes
    };

    // Helper function to reassign entries from failed node
    func reassignEntries(failedNode : NodeId) {
        let entries = natMap.get(nodeEntries, failedNode);
        switch (entries) {
            case (null) { return };
            case (?keys) {
                for (key in keys.vals()) {
                    let entry = textMap.get(cache, key);
                    switch (entry) {
                        case (null) {};
                        case (?e) {
                            let newReplica = findNewReplica(e.primaryNode);
                            let newEntry : CacheEntry = {
                                value = e.value;
                                primaryNode = e.primaryNode;
                                replicaNode = newReplica;
                            };
                            cache := textMap.put(cache, key, newEntry);

                            // Update new replica node entries
                            let currentEntries = natMap.get(nodeEntries, newReplica);
                            switch (currentEntries) {
                                case (null) {
                                    nodeEntries := natMap.put(nodeEntries, newReplica, [key]);
                                };
                                case (?ce) {
                                    nodeEntries := natMap.put(nodeEntries, newReplica, Array.append(ce, [key]));
                                };
                            };
                        };
                    };
                };
            };
        };
        nodeEntries := natMap.put(nodeEntries, failedNode, []);
    };

    // Helper function to restore entries to recovering node
    func restoreEntries(recoveringNode : NodeId) {
        for ((key, entry) in textMap.entries(cache)) {
            if (entry.replicaNode == recoveringNode) {
                let newEntry : CacheEntry = {
                    value = entry.value;
                    primaryNode = entry.primaryNode;
                    replicaNode = recoveringNode;
                };
                cache := textMap.put(cache, key, newEntry);

                // Update recovering node entries
                let currentEntries = natMap.get(nodeEntries, recoveringNode);
                switch (currentEntries) {
                    case (null) {
                        nodeEntries := natMap.put(nodeEntries, recoveringNode, [key]);
                    };
                    case (?ce) {
                        nodeEntries := natMap.put(nodeEntries, recoveringNode, Array.append(ce, [key]));
                    };
                };
            };
        };
    };

    // Helper function to update node status
    func updateNodeStatus(nodeId : NodeId, newStatus : NodeStatus) {
        let oldStatus = natMap.get(nodeStatuses, nodeId);
        nodeStatuses := natMap.put(nodeStatuses, nodeId, newStatus);

        switch (newStatus) {
            case (#Failed) {
                reassignEntries(nodeId);
            };
            case (#Healthy) {
                switch (oldStatus) {
                    case (?#Recovering) {
                        restoreEntries(nodeId);
                    };
                    case (_) {};
                };
            };
            case (_) {};
        };
    };

    // Helper function to get node status
    func getNodeStatus(nodeId : NodeId) : NodeStatus {
        switch (natMap.get(nodeStatuses, nodeId)) {
            case (null) { #Failed };
            case (?status) { status };
        }
    };

    // Helper function to get node responsible for a key
    func getNodeForKey(key : Key) : NodeId {
        let hashValue = Nat32.toNat(Text.hash(key));
        hashValue % numNodes;
    };

    // Helper function to get replica node
    func getReplicaNode(primaryNode : NodeId) : NodeId {
        let healthyNodes = getHealthyNodes();
        if (healthyNodes.size() == 1) {
            return healthyNodes[0];
        };
        (primaryNode + 1) % numNodes;
    };

    // Helper function to update node entries
    func updateNodeEntries(nodeId : NodeId, key : Key) {
        let currentEntries = natMap.get(nodeEntries, nodeId);
        switch (currentEntries) {
            case (null) {
                nodeEntries := natMap.put(nodeEntries, nodeId, [key]);
            };
            case (?entries) {
                nodeEntries := natMap.put(nodeEntries, nodeId, Array.append(entries, [key]));
            };
        };
    };

    // Helper function to remove entry from node
    func removeEntryFromNode(nodeId : NodeId, key : Key) {
        let currentEntries = natMap.get(nodeEntries, nodeId);
        switch (currentEntries) {
            case (null) {};
            case (?entries) {
                let newEntries = Array.filter(entries, func(k : Key) : Bool { k != key });
                nodeEntries := natMap.put(nodeEntries, nodeId, newEntries);
            };
        };
    };

    // Cache operations
    public shared ({ caller }) func set(key : Key, value : Value) : async Bool {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can set cache entries");
        };

        let primaryNode = getNodeForKey(key);
        let replicaNode = getReplicaNode(primaryNode);

        if (getNodeStatus(primaryNode) == #Failed) {
            Debug.print("Primary node is down. Using replica.");
            if (getNodeStatus(replicaNode) == #Failed) {
                Debug.print("Both primary and replica nodes are down.");
                return false;
            };
        };

        let entry : CacheEntry = {
            value = value;
            primaryNode = primaryNode;
            replicaNode = replicaNode;
        };

        cache := textMap.put(cache, key, entry);
        updateNodeEntries(primaryNode, key);
        updateNodeEntries(replicaNode, key);

        true;
    };

    public query ({ caller }) func get(key : Key) : async ?Value {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can get cache entries");
        };

        let entry = textMap.get(cache, key);
        switch (entry) {
            case (null) { null };
            case (?e) {
                if (getNodeStatus(e.primaryNode) == #Failed) {
                    Debug.print("Primary node is down. Using replica.");
                    if (getNodeStatus(e.replicaNode) == #Failed) {
                        Debug.print("Both primary and replica nodes are down.");
                        null;
                    } else {
                        ?e.value;
                    };
                } else {
                    ?e.value;
                };
            };
        };
    };

    public shared ({ caller }) func deleteEntry(key : Key) : async Bool {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can delete cache entries");
        };

        let entry = textMap.get(cache, key);
        switch (entry) {
            case (null) { false };
            case (?e) {
                if (getNodeStatus(e.primaryNode) == #Failed) {
                    Debug.print("Primary node is down. Using replica.");
                    if (getNodeStatus(e.replicaNode) == #Failed) {
                        Debug.print("Both primary and replica nodes are down.");
                        return false;
                    };
                };

                cache := textMap.delete(cache, key);
                removeEntryFromNode(e.primaryNode, key);
                removeEntryFromNode(e.replicaNode, key);
                true;
            };
        };
    };

    // Health monitoring and failure simulation
    public shared ({ caller }) func simulateFailure(nodeId : NodeId) : async () {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can simulate node failure");
        };
        updateNodeStatus(nodeId, #Failed);
    };

    public shared ({ caller }) func simulateRecovery(nodeId : NodeId) : async () {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can simulate node recovery");
        };
        updateNodeStatus(nodeId, #Recovering);
        // Simulate recovery delay
        let _ = Time.now();
        updateNodeStatus(nodeId, #Healthy);
    };

    public query ({ caller }) func getCacheState() : async [(Key, CacheEntry)] {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can get cache state");
        };
        Iter.toArray(textMap.entries(cache));
    };

    public query ({ caller }) func getNodeStatuses() : async [(NodeId, NodeStatus)] {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can get node statuses");
        };
        Iter.toArray(natMap.entries(nodeStatuses));
    };

    public query ({ caller }) func getNodeEntries() : async [(NodeId, [Key])] {
        if (not (AdminSystem.isCurrentUserAdmin(adminState, caller))) {
            Debug.trap("Unauthorized: Only admin can get node entries");
        };
        Iter.toArray(natMap.entries(nodeEntries));
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
