import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActors';
import type { Key, Value, NodeId, CacheEntry, NodeStatus, UserProfile } from '../backend';
import { nodeStatusFromVariant } from '../backend';

export function useCacheState() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Key, CacheEntry]>>({
    queryKey: ['cacheState'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return actor.getCacheStateAnonymous();
      } catch (error) {
        console.warn('Failed to get cache state with anonymous method, trying authenticated method:', error);
        return actor.getCacheState();
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
  });
}

export function useNodeStatuses() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[NodeId, NodeStatus]>>({
    queryKey: ['nodeStatuses'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const variantData = await actor.getNodeStatusesAnonymous();
        return variantData.map(([nodeId, statusVariant]) => [nodeId, nodeStatusFromVariant(statusVariant)]);
      } catch (error) {
        console.warn('Failed to get node statuses with anonymous method, trying authenticated method:', error);
        const variantData = await actor.getNodeStatuses();
        return variantData.map(([nodeId, statusVariant]) => [nodeId, nodeStatusFromVariant(statusVariant)]);
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 1000, // Refresh every second for real-time health monitoring
  });
}

export function useNodeEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[NodeId, Array<Key>]>>({
    queryKey: ['nodeEntries'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return actor.getNodeEntriesAnonymous();
      } catch (error) {
        console.warn('Failed to get node entries with anonymous method, trying authenticated method:', error);
        return actor.getNodeEntries();
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 2000,
  });
}

export function useSetCache() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: Key; value: Value }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return actor.setAnonymous(key, value);
      } catch (error) {
        console.warn('Failed to set cache with anonymous method, trying authenticated method:', error);
        return actor.set(key, value);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cacheState'] });
      queryClient.invalidateQueries({ queryKey: ['nodeEntries'] });
    },
  });
}

export function useGetCache() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (key: Key) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return actor.getAnonymous(key);
      } catch (error) {
        console.warn('Failed to get cache with anonymous method, trying authenticated method:', error);
        return actor.get(key);
      }
    },
  });
}

export function useDeleteCache() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: Key) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return actor.deleteEntryAnonymous(key);
      } catch (error) {
        console.warn('Failed to delete cache with anonymous method, trying authenticated method:', error);
        return actor.deleteEntry(key);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cacheState'] });
      queryClient.invalidateQueries({ queryKey: ['nodeEntries'] });
    },
  });
}

export function useSimulateFailure() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nodeId: NodeId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.simulateFailure(nodeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodeStatuses'] });
      queryClient.invalidateQueries({ queryKey: ['cacheState'] });
      queryClient.invalidateQueries({ queryKey: ['nodeEntries'] });
    },
  });
}

export function useSimulateRecovery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nodeId: NodeId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.simulateRecovery(nodeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodeStatuses'] });
      queryClient.invalidateQueries({ queryKey: ['cacheState'] });
      queryClient.invalidateQueries({ queryKey: ['nodeEntries'] });
    },
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCurrentUserAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
