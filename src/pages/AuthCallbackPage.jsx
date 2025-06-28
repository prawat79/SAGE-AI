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
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session) {
          console.log('Authentication successful:', data.session.user.email);
          // Small delay to ensure auth state is updated
          setTimeout(() => {
            navigate('/explore');
          }, 1000);
        } else {
          // Check for hash fragments (OAuth callback)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            // Set the session manually
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              setError('Failed to establish session. Please try again.');
              setTimeout(() => navigate('/login'), 3000);
            } else {
              console.log('Session established:', sessionData.user.email);
              setTimeout(() => {
                navigate('/explore');
              }, 1000);
            }
          } else {
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