import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);

        // First, try to get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('Session found:', sessionData.session.user.email);
          setTimeout(() => {
            navigate('/explore');
          }, 1000);
          return;
        }

        // If no session, check for OAuth callback parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Check for error in URL params
        const errorParam = urlParams.get('error') || hashParams.get('error');
        if (errorParam) {
          console.error('OAuth error:', errorParam);
          setError(`Authentication failed: ${errorParam}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Check for access token in hash
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          console.log('Access token found, setting session...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setError('Failed to establish session. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
          } else {
            console.log('Session established successfully:', data.user.email);
            setTimeout(() => {
              navigate('/explore');
            }, 1000);
          }
        } else {
          // Check for authorization code (PKCE flow)
          const code = urlParams.get('code');
          if (code) {
            console.log('Authorization code found, exchanging for session...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Error exchanging code:', error);
              setError('Failed to complete authentication. Please try again.');
              setTimeout(() => navigate('/login'), 3000);
            } else {
              console.log('Code exchange successful:', data.user.email);
              setTimeout(() => {
                navigate('/explore');
              }, 1000);
            }
          } else {
            console.log('No authentication data found');
            setError('No authentication data found. Please try signing in again.');
            setTimeout(() => navigate('/login'), 3000);
          }
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Completing Sign In...</h2>
          <div className="w-8 h-8 spinner mx-auto"></div>
          <p className="text-gray-400 mt-4">Please wait while we complete your authentication</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Authentication Successful!</h2>
        <p className="text-gray-400">Redirecting you to the app...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;