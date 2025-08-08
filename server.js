#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Force port 8080 if no PORT env var is set, or if we detect we're in a deployment that expects 8080
const PORT = process.env.PORT || 8080;

console.log('=== SERVER STARTUP ===');
console.log(`Environment PORT: ${process.env.PORT}`);
console.log(`Using PORT: ${PORT}`);
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`Google Client ID configured: ${!!process.env.GOOGLE_CLIENT_ID}`);
console.log(`Google Client Secret configured: ${!!process.env.GOOGLE_CLIENT_SECRET}`);

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
console.log(`Dist path: ${distPath}`);

try {
  const distExists = fs.existsSync(distPath);
  console.log(`Dist directory exists: ${distExists}`);
  
  if (distExists) {
    const files = fs.readdirSync(distPath);
    console.log(`Files in dist: ${files.join(', ')}`);
  }
} catch (error) {
  console.error('Error checking dist directory:', error);
}

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://localhost:3000',
    'https://localhost:5173',
    // Add your production domains here
    process.env.FRONTEND_URL,
    process.env.PRODUCTION_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ===== GOOGLE CALENDAR API ENDPOINTS =====

// OAuth Token Exchange Endpoint
app.post('/api/oauth/google/callback', async (req, res) => {
  console.log('Google OAuth callback received');
  
  try {
    const { code } = req.body;
    
    if (!code) {
      console.error('No authorization code provided');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/oauth/callback`;
    
    console.log('Exchanging code for tokens...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange failed:', error);
      return res.status(400).json({ 
        error: 'Failed to exchange code for tokens', 
        details: error 
      });
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received, fetching user info...');

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to get user info');
      return res.status(400).json({ error: 'Failed to get user info' });
    }

    const userInfo = await userResponse.json();
    console.log(`Successfully authenticated user: ${userInfo.email}`);

    // Return tokens and user info
    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Token Refresh Endpoint
app.post('/api/oauth/google/refresh', async (req, res) => {
  console.log('Token refresh requested');
  
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Token refresh failed:', error);
      return res.status(400).json({ 
        error: 'Failed to refresh token', 
        details: error 
      });
    }

    const tokens = await response.json();
    console.log('Token refreshed successfully');
    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Calendar List Endpoint
app.get('/api/calendar/list', async (req, res) => {
  console.log('Calendar list requested');
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const accessToken = authHeader.substring(7);

    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Calendar list fetch failed:', error);
      return res.status(response.status).json({ 
        error: 'Failed to fetch calendar list', 
        details: error 
      });
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} calendars`);
    res.json(data);
  } catch (error) {
    console.error('Calendar list error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Calendar Events Endpoint
app.get('/api/calendar/events', async (req, res) => {
  console.log('Calendar events requested');
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const accessToken = authHeader.substring(7);
    const { calendarId, timeMin, timeMax, maxResults = '250' } = req.query;

    if (!calendarId || !timeMin || !timeMax) {
      return res.status(400).json({ 
        error: 'calendarId, timeMin, and timeMax are required' 
      });
    }

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      timeMin: timeMin,
      timeMax: timeMax,
    });

    console.log(`Fetching events for calendar: ${calendarId}`);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Calendar events fetch failed:', error);
      return res.status(response.status).json({ 
        error: 'Failed to fetch calendar events', 
        details: error 
      });
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} events for calendar ${calendarId}`);
    res.json(data);
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Create Calendar Event Endpoint
app.post('/api/calendar/events', async (req, res) => {
  console.log('Create calendar event requested');
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const accessToken = authHeader.substring(7);
    const { calendarId = 'primary', event } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event data is required' });
    }

    console.log(`Creating event in calendar: ${calendarId}`);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Event creation failed:', error);
      return res.status(response.status).json({ 
        error: 'Failed to create event', 
        details: error 
      });
    }

    const data = await response.json();
    console.log(`Event created successfully: ${data.id}`);
    res.json(data);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ===== EXISTING ENDPOINTS =====

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    port: PORT,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    },
    features: {
      googleCalendar: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      cors: true
    }
  });
});

// Root endpoint for debugging
app.get('/debug', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    port: PORT,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'configured' : 'not configured'
    }
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      'POST /api/oauth/google/callback': 'Google OAuth token exchange',
      'POST /api/oauth/google/refresh': 'Refresh Google access token',
      'GET /api/calendar/list': 'Get Google calendar list',
      'GET /api/calendar/events': 'Get calendar events',
      'POST /api/calendar/events': 'Create calendar event'
    }
  });
});

// Handle SPA routing - serve index.html for all routes (must be last)
app.get('*', (req, res) => {
  console.log(`Serving SPA route: ${req.path}`);
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  try {
    res.sendFile(indexPath);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error serving application');
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`🔧 Debug info at http://0.0.0.0:${PORT}/debug`);
  console.log(`📅 API status at http://0.0.0.0:${PORT}/api/status`);
  console.log(`🔗 Google Calendar API endpoints ready`);
  console.log('=== SERVER READY ===');
});

// Enhanced error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});