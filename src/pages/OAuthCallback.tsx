// src/pages/OAuthCallback.tsx - Fixed Version
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const scope = searchParams.get('scope');

    console.log('OAuth callback received:', { code: !!code, state, error, scope });

    if (error) {
      // Handle OAuth error
      console.error('OAuth error:', error);
      if (window.opener) {
        try {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: error,
          }, window.location.origin);
        } catch (e) {
          console.error('Error posting message to opener:', e);
        }
      }
      
      // Try to close window, but don't fail if we can't
      try {
        window.close();
      } catch (e) {
        console.log('Cannot close window, redirecting instead');
        navigate('/');
      }
      return;
    }

    if (code && state === 'google-calendar') {
      // Check if we have calendar scopes
      const hasCalendarScopes = scope?.includes('calendar.readonly') || scope?.includes('calendar.events');
      
      if (!hasCalendarScopes) {
        console.error('Missing calendar scopes in OAuth response');
        if (window.opener) {
          try {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: 'Missing calendar permissions. Please try again and grant calendar access.',
            }, window.location.origin);
          } catch (e) {
            console.error('Error posting message to opener:', e);
          }
        }
        
        try {
          window.close();
        } catch (e) {
          navigate('/');
        }
        return;
      }

      // Handle successful Google Calendar OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email') || 'unknown@example.com';

      console.log('OAuth success, posting message to opener');

      if (window.opener) {
        try {
          window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            provider: 'google',
            code: code,
            email: email,
            scope: scope,
          }, window.location.origin);
        } catch (e) {
          console.error('Error posting message to opener:', e);
        }
      }
      
      // Try to close window
      try {
        window.close();
      } catch (e) {
        console.log('Cannot close window automatically, showing close message');
        // If we can't close the window, show a message
        document.body.innerHTML = `
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <h2>✅ Authorization Successful!</h2>
              <p>You can close this window and return to the app.</p>
              <button onclick="window.close()" style="padding: 10px 20px; background: #4285F4; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Close Window
              </button>
            </div>
          </div>
        `;
      }
    } else {
      // Invalid callback, redirect to home
      console.log('Invalid OAuth callback parameters');
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing authentication...</p>
        <p className="text-xs text-muted-foreground mt-2">
          If this takes too long, you can close this window and try again.
        </p>
      </div>
    </div>
  );
}