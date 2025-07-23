import React from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { Loader2 } from 'lucide-react';

const LoginButton: React.FC = () => {
    const { login, clear, loginStatus, identity } = useInternetIdentity();

    // Identity might be present even if loginStatus is idle, since is saved in local storage
    const isAuthenticated = !!identity;
    const disabled = loginStatus === 'logging-in';

    // Determine button text based on both the loginStatus and identity presence
    const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
        } else {
            try {
                await login();
            } catch (error: any) {
                console.error('Login error:', error);
                // If we get "already authenticated" but the UI doesn't show it,
                // it's a state inconsistency - clear and try again
                if (error.message === 'User is already authenticated') {
                    await clear();
                    setTimeout(() => {
                        login();
                    }, 300);
                }
            }
        }
    };

    return (
        <button
            onClick={handleAuth}
            disabled={disabled}
            className={`px-6 py-2 rounded-full transition-colors ${
                isAuthenticated
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50`}
        >
            {disabled && <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />}
            {text}
        </button>
    );
};

export default LoginButton;
