#!/usr/bin/env node

const express = require('express');
const path = require('path');

const app = express();
// Force port 8080 if no PORT env var is set, or if we detect we're in a deployment that expects 8080
const PORT = process.env.PORT || 8080;

console.log('=== SERVER STARTUP ===');
console.log(`Environment PORT: ${process.env.PORT}`);
console.log(`Using PORT: ${PORT}`);
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${process.cwd()}`);

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
console.log(`Dist path: ${distPath}`);

try {
  const fs = require('fs');
  const distExists = fs.existsSync(distPath);
  console.log(`Dist directory exists: ${distExists}`);
  
  if (distExists) {
    const files = fs.readdirSync(distPath);
    console.log(`Files in dist: ${files.join(', ')}`);
  }
} catch (error) {
  console.error('Error checking dist directory:', error);
}

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
    env: process.env
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
  res.status(500).json({ error: 'Internal server error', message: error.message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`🔧 Debug info at http://0.0.0.0:${PORT}/debug`);
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