import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor, type backendInterface } from '../backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const ACTOR_QUERY_KEY = 'actor';
export function useActor() {
    const { identity } = useInternetIdentity();
    const queryClient = useQueryClient();

    const actorQuery = useQuery<backendInterface>({
        queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
        queryFn: async () => {
            const isAuthenticated = !!identity;

            try {
                if (!isAuthenticated) {
                    // Return anonymous actor if not authenticated
                    return await createActor();
                }

                const actorOptions = {
                    agentOptions: {
                        identity
                    }
                };

                const actor = await createActor(actorOptions);
                // Only call initializeAuth if we have an identity
                try {
                    await actor.initializeAuth();
                } catch (error) {
                    console.warn('Failed to initialize auth:', error);
                }
                return actor;
            } catch (error) {
                console.error('Failed to create actor:', error);
                throw error;
            }
        },
        // Only refetch when identity changes
        staleTime: Infinity,
        // This will cause the actor to be recreated when the identity changes
        enabled: true,
        retry: 3,
        retryDelay: 1000,
    });

    // When the actor changes, invalidate dependent queries
    useEffect(() => {
        if (actorQuery.data) {
            queryClient.invalidateQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
            queryClient.refetchQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
        }
    }, [actorQuery.data, queryClient]);

    return {
        actor: actorQuery.data || null,
        isFetching: actorQuery.isFetching
    };
}
