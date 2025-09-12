import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Memory optimization
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    target: 'esnext',
    
    // More reasonable chunk size limits
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      maxParallelFileOps: 2,
      
      output: {
        // Simplified chunk splitting - REMOVE aggressive CVA splitting
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            
            // React ecosystem
            if (id.includes('react/') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'react'
            }
            if (id.includes('react-dom/')) {
              return 'react-dom'
            }
            if (id.includes('react-router')) {
              return 'react-router'
            }
            
            // Radix UI - group together instead of splitting
            if (id.includes('@radix-ui/')) {
              return 'radix-ui'
            }
            
            // Charts
            if (id.includes('recharts')) {
              return 'charts'
            }
            
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            
            // Date utilities
            if (id.includes('date-fns/')) {
              return 'date-utils'
            }
            
            // Google Maps
            if (id.includes('@googlemaps')) {
              return 'maps'
            }
            
            // Query/State management
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            
            // OAuth
            if (id.includes('@react-oauth')) {
              return 'oauth'
            }
            
            // IMPORTANT: Keep styling utilities together in one chunk
            // DO NOT split class-variance-authority separately
            if (id.includes('clsx') || 
                id.includes('tailwind-merge') || 
                id.includes('class-variance-authority')) {
              return 'style-utils'
            }
            
            // Theme
            if (id.includes('next-themes')) {
              return 'themes'
            }
            
            // Toast
            if (id.includes('sonner')) {
              return 'toast'
            }
            
            // Everything else
            return 'vendor'
          }
          
          // App code splitting
          if (id.includes('src/components/ui/')) {
            return 'ui-components'
          }
          if (id.includes('src/components/')) {
            return 'components'
          }
          if (id.includes('src/pages/')) {
            return 'pages'
          }
          if (id.includes('src/lib/')) {
            return 'lib'
          }
          if (id.includes('src/hooks/')) {
            return 'hooks'
          }
        },
        
        // Optimize file names
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]'
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'class-variance-authority'],
    exclude: ['@googlemaps/js-api-loader']
  }
})