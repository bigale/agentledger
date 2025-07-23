import React, { useState } from 'react';
import { useSetCache, useGetCache, useDeleteCache } from '../hooks/useQueries';
import { Plus, Search, Trash2, Loader2 } from 'lucide-react';

const CacheManager: React.FC = () => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState('');

  const setMutation = useSetCache();
  const getMutation = useGetCache();
  const deleteMutation = useDeleteCache();

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;

    try {
      const success = await setMutation.mutateAsync({ key: key.trim(), value: value.trim() });
      if (success) {
        setKey('');
        setValue('');
      }
    } catch (error) {
      console.error('Failed to set cache entry:', error);
    }
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;

    try {
      const result = await getMutation.mutateAsync(searchKey.trim());
      setSearchResult(result);
    } catch (error) {
      console.error('Failed to get cache entry:', error);
      setSearchResult(null);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteKey.trim()) return;

    try {
      const success = await deleteMutation.mutateAsync(deleteKey.trim());
      if (success) {
        setDeleteKey('');
      }
    } catch (error) {
      console.error('Failed to delete cache entry:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Cache Operations</h2>
      
      <div className="space-y-6">
        {/* Set Operation */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-green-500" />
            Add Entry
          </h3>
          <form onSubmit={handleSet} className="space-y-3">
            <input
              type="text"
              placeholder="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={setMutation.isPending || !key.trim() || !value.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium flex items-center justify-center"
            >
              {setMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add to Cache'
              )}
            </button>
          </form>
        </div>

        {/* Get Operation */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-500" />
            Retrieve Entry
          </h3>
          <form onSubmit={handleGet} className="space-y-3">
            <input
              type="text"
              placeholder="Key to search"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={getMutation.isPending || !searchKey.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium flex items-center justify-center"
            >
              {getMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search Cache'
              )}
            </button>
          </form>
          {searchResult !== null && (
            <div className="mt-3 p-3 bg-gray-700 rounded-md">
              <div className="text-sm text-gray-400">Result:</div>
              <div className="font-mono">
                {searchResult || 'Key not found'}
              </div>
            </div>
          )}
        </div>

        {/* Delete Operation */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Trash2 className="w-5 h-5 mr-2 text-red-500" />
            Delete Entry
          </h3>
          <form onSubmit={handleDelete} className="space-y-3">
            <input
              type="text"
              placeholder="Key to delete"
              value={deleteKey}
              onChange={(e) => setDeleteKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={deleteMutation.isPending || !deleteKey.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium flex items-center justify-center"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete from Cache'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CacheManager;
