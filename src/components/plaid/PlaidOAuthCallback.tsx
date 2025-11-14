import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plaidService } from '../../services/plaidService';

export default function PlaidOAuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                const receivedRedirectUri = window.location.href;

                // Call your backend to handle the OAuth callback
                await plaidService.handleOAuthCallback(receivedRedirectUri);

                // Redirect to dashboard on success
                navigate('/dashboard');
            } catch (error) {
                console.error('OAuth callback error:', error);
                setError('Failed to complete bank connection. Please try again.');
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">❌</div>
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Failed</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-white px-4 py-2 rounded hover:opacity-90"
                        style={{backgroundColor: 'var(--heritage-green)'}}
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: 'var(--heritage-gold)'}}></div>
                <h2 className="text-xl font-semibold mb-2">Completing Bank Connection</h2>
                <p className="text-gray-600">Please wait while we finalize your bank connection...</p>
            </div>
        </div>
    );
}