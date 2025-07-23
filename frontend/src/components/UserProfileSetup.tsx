import React, { useState } from 'react';
import { useUserProfile, useSaveUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { User, Edit2, Check, X } from 'lucide-react';

const UserProfileSetup: React.FC = () => {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading } = useUserProfile();
    const saveProfileMutation = useSaveUserProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');

    React.useEffect(() => {
        if (userProfile) {
            setName(userProfile.name);
        } else if (identity && !isLoading && !userProfile) {
            // First time user, show editing mode
            setIsEditing(true);
        }
    }, [userProfile, identity, isLoading]);

    const handleSave = async () => {
        if (!name.trim()) return;
        
        try {
            await saveProfileMutation.mutateAsync({ name: name.trim() });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    const handleCancel = () => {
        setName(userProfile?.name || '');
        setIsEditing(false);
    };

    if (!identity) return null;

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2 text-gray-400">
                <User className="w-5 h-5" />
                <span>Loading...</span>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-400" />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    disabled={!name.trim() || saveProfileMutation.isPending}
                    className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                >
                    <Check className="w-4 h-4" />
                </button>
                {userProfile && (
                    <button
                        onClick={handleCancel}
                        disabled={saveProfileMutation.isPending}
                        className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 text-gray-300">
            <User className="w-5 h-5 text-blue-400" />
            <span>{userProfile?.name || 'Anonymous'}</span>
            <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-300"
            >
                <Edit2 className="w-3 h-3" />
            </button>
        </div>
    );
};

export default UserProfileSetup;
