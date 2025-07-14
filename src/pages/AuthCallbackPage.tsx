import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        addDebugInfo('Starting auth callback handler...');
        addDebugInfo(`Current URL: ${window.location.href}`);
        addDebugInfo(`Hash: ${window.location.hash}`);
        addDebugInfo(`Search: ${window.location.search}`);

        // Check for error parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const errorParam = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        
        if (errorParam) {
          addDebugInfo(`OAuth error detected: ${errorParam}`);
          if (errorDescription) {
            addDebugInfo(`Error description: ${errorDescription}`);
          }
          setError(`Authentication failed: ${errorParam}${errorDescription ? ` - ${errorDescription}` : ''}`);
          setTimeout(() => navigate('/login'), 5000);
          return;
        }

        // Try to get current session first
        addDebugInfo('Checking for existing session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addDebugInfo(`Session error: ${sessionError.message}`);
        }
        
        if (sessionData.session) {
          addDebugInfo(`Existing session found for: ${sessionData.session.user.email}`);
          addDebugInfo('Redirecting to explore page...');
          setTimeout(() => {
            navigate('/explore');
          }, 2000);
          return;
        }

        addDebugInfo('No existing session found, checking callback parameters...');

        // Check for PKCE authorization code (most common for OAuth)
        const code = urlParams.get('code');
        if (code) {
          addDebugInfo('Authorization code found, exchanging for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            addDebugInfo(`Code exchange error: ${error.message}`);
            setError(`Failed to complete authentication: ${error.message}`);
            setTimeout(() => navigate('/login'), 5000);
          } else {
            addDebugInfo(`Code exchange successful for: ${data.user.email}`);
            addDebugInfo('Redirecting to explore page...');
            setTimeout(() => {
              navigate('/explore');
            }, 2000);
          }
          return;
        }

        // Check for access token in hash (implicit flow - less common)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          addDebugInfo('Access token found in hash, setting session...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            addDebugInfo(`Session setting error: ${error.message}`);
            setError(`Failed to establish session: ${error.message}`);
            setTimeout(() => navigate('/login'), 5000);
          } else {
            addDebugInfo(`Session established for: ${data.user.email}`);
            addDebugInfo('Redirecting to explore page...');
            setTimeout(() => {
              navigate('/explore');
            }, 2000);
          }
          return;
        }

        // No authentication data found
        addDebugInfo('No authentication data found in URL');
        setError('No authentication data found. Please try signing in again.');
        setTimeout(() => navigate('/login'), 5000);

      } catch (err) {
        addDebugInfo(`Unexpected error: ${err.message}`);
        console.error('Unexpected error during auth callback:', err);
        setError(`An unexpected error occurred: ${err.message}`);
        setTimeout(() => navigate('/login'), 5000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Completing Sign In...</h2>
            <div className="w-8 h-8 spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Please wait while we complete your authentication</p>
          </div>

          {/* Debug Information */}
          <div className="glass rounded-xl p-4 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Debug Information:</h3>
            <div className="space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs text-gray-400 font-mono">
                  {info}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Error</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login page in 5 seconds...</p>
            
            <button
              onClick={() => navigate('/login')}
              className="mt-4 btn-primary px-6 py-2 rounded-xl"
            >
              Go to Login Now
            </button>
          </div>

          {/* Debug Information */}
          <div className="glass rounded-xl p-4 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Debug Information:</h3>
            <div className="space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs text-gray-400 font-mono">
                  {info}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Authentication Successful!</h2>
        <p className="text-gray-400">Redirecting you to the app...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;