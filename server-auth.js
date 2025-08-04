// server-auth.js - Enhanced OAuth backend with detailed fixes
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Environment variables with validation
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "246690586453-lhel5i1bk1gmn503u6to8rsl8r3d3hrb.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://plankton-app-9ml95.ondigitalocean.app";
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Server starting with config:');
console.log(`- Environment: ${NODE_ENV}`);
console.log(`- Port: ${PORT}`);
console.log(`- Frontend URL: ${FRONTEND_URL}`);
console.log(`- Google Client ID: ${GOOGLE_CLIENT_ID ? 'Set' : 'Missing'}`);
console.log(`- Google Client Secret: ${GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing'}`);

// ENHANCED CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://plankton-app-9ml95.ondigitalocean.app',
      FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // Allow in development - remove in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Serve static files (your built React app)
app.use(express.static(path.join(__dirname, 'dist')));

// ENHANCED OAuth callback endpoint
app.post('/api/oauth/google/callback', async (req, res) => {
  console.log('📥 OAuth callback received');
  
  try {
    const { code } = req.body;
    
    if (!code) {
      console.error('❌ No authorization code provided');
      return res.status(400).json({ 
        error: 'No authorization code provided',
        details: 'The OAuth flow must provide an authorization code'
      });
    }

    if (!GOOGLE_CLIENT_SECRET) {
      console.error('❌ GOOGLE_CLIENT_SECRET environment variable not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Google OAuth credentials not properly configured'
      });
    }

    console.log('🔄 Exchanging authorization code for tokens...');
    
    // CRITICAL: Use the exact redirect URI that matches Google Cloud Console
    const redirectUri = `${FRONTEND_URL}/oauth/callback`;
    console.log(`🔗 Using redirect URI: ${redirectUri}`);
    
    const tokenRequestBody = {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    };

    console.log('📤 Token request params:', {
      ...tokenRequestBody,
      client_secret: '[REDACTED]'
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenRequestBody),
    });

    console.log(`📨 Token response status: ${tokenResponse.status}`);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorText);
      
      let errorMessage = 'Failed to exchange code for tokens';
      if (errorText.includes('invalid_grant')) {
        errorMessage = 'Authorization code expired or invalid. Please try connecting again.';
      } else if (errorText.includes('redirect_uri_mismatch')) {
        errorMessage = 'Redirect URI mismatch. Please contact support.';
      }
      
      return res.status(400).json({ 
        error: errorMessage,
        details: errorText,
        status: tokenResponse.status
      });
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Tokens received successfully');
    console.log('🔑 Token info:', {
      access_token: tokens.access_token ? '[PRESENT]' : '[MISSING]',
      refresh_token: tokens.refresh_token ? '[PRESENT]' : '[MISSING]',
      expires_in: tokens.expires_in
    });

    // Get user info using the access token
    console.log('👤 Fetching user information...');
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('❌ Failed to fetch user info:', errorText);
      return res.status(400).json({ 
        error: 'Failed to fetch user info',
        details: errorText 
      });
    }

    const userInfo = await userInfoResponse.json();
    console.log('✅ User info retrieved:', {
      email: userInfo.email,
      name: userInfo.name
    });
    
    // Return complete token and user information
    const responseData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type || 'Bearer',
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      verified_email: userInfo.verified_email
    };

    console.log('📤 Sending response to client');
    res.json(responseData);

  } catch (error) {
    console.error('💥 OAuth callback error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Token refresh endpoint
app.post('/api/oauth/google/refresh', async (req, res) => {
  console.log('🔄 Token refresh requested');
  
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      console.error('❌ No refresh token provided');
      return res.status(400).json({ 
        error: 'No refresh token provided',
        details: 'A refresh token is required to get a new access token'
      });
    }

    if (!GOOGLE_CLIENT_SECRET) {
      console.error('❌ GOOGLE_CLIENT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('📤 Requesting new access token...');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token refresh failed:', errorText);
      return res.status(400).json({ 
        error: 'Failed to refresh token',
        details: errorText 
      });
    }

    const tokens = await response.json();
    console.log('✅ Token refreshed successfully');
    
    res.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type || 'Bearer'
    });

  } catch (error) {
    console.error('💥 Token refresh error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT
  });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 External URL: ${FRONTEND_URL}`);
});