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
    
    // Very aggressive chunk size limits
    chunkSizeWarningLimit: 200, // Even stricter limit
    
    rollupOptions: {
      maxParallelFileOps: 2,
      
      output: {
        // Extremely granular chunk splitting
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            
            // React ecosystem - smallest possible chunks
            if (id.includes('react/') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'react'
            }
            if (id.includes('react-dom/')) {
              return 'react-dom'
            }
            if (id.includes('react-router')) {
              return 'react-router'
            }
            if (id.includes('scheduler')) {
              return 'react-scheduler'
            }
            
            // Split Radix into very small chunks
            if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-alert-dialog')) {
              return 'radix-dialogs'
            }
            if (id.includes('@radix-ui/react-popover') || id.includes('@radix-ui/react-tooltip')) {
              return 'radix-overlays'
            }
            if (id.includes('@radix-ui/react-select') || id.includes('@radix-ui/react-dropdown-menu')) {
              return 'radix-dropdowns'
            }
            if (id.includes('@radix-ui/react-menubar') || id.includes('@radix-ui/react-navigation-menu')) {
              return 'radix-menus'
            }
            if (id.includes('@radix-ui/react-accordion') || id.includes('@radix-ui/react-collapsible')) {
              return 'radix-collapse'
            }
            if (id.includes('@radix-ui/react-tabs') || id.includes('@radix-ui/react-separator')) {
              return 'radix-layout'
            }
            if (id.includes('@radix-ui/react-checkbox') || id.includes('@radix-ui/react-switch')) {
              return 'radix-inputs'
            }
            if (id.includes('@radix-ui/react-slider') || id.includes('@radix-ui/react-progress')) {
              return 'radix-progress'
            }
            if (id.includes('@radix-ui/react-avatar') || id.includes('@radix-ui/react-aspect-ratio')) {
              return 'radix-display'
            }
            if (id.includes('@radix-ui/react-toast') || id.includes('@radix-ui/react-hover-card')) {
              return 'radix-feedback'
            }
            if (id.includes('@radix-ui/react-scroll-area') || id.includes('@radix-ui/react-context-menu')) {
              return 'radix-interaction'
            }
            if (id.includes('@radix-ui/react-toggle') || id.includes('@radix-ui/react-radio-group')) {
              return 'radix-controls'
            }
            if (id.includes('@radix-ui')) {
              return 'radix-misc'
            }
            
            // Forms - split into smaller pieces
            if (id.includes('react-hook-form')) {
              return 'form-core'
            }
            if (id.includes('@hookform/resolvers')) {
              return 'form-resolvers'
            }
            if (id.includes('zod/')) {
              return 'zod'
            }
            
            // Charts - split if possible
            if (id.includes('recharts/es6/') && (id.includes('chart') || id.includes('Chart'))) {
              return 'charts-components'
            }
            if (id.includes('recharts/es6/') && (id.includes('util') || id.includes('helper'))) {
              return 'charts-utils'
            }
            if (id.includes('recharts')) {
              return 'charts-core'
            }
            
            // Icons - separate chunk
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
            
            // Carousel
            if (id.includes('embla-carousel')) {
              return 'carousel'
            }
            
            // OAuth
            if (id.includes('@react-oauth')) {
              return 'oauth'
            }
            
            // Styling utilities - very small
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'style-utils'
            }
            if (id.includes('class-variance-authority')) {
              return 'cva'
            }
            
            // Theme
            if (id.includes('next-themes')) {
              return 'themes'
            }
            
            // Command palette
            if (id.includes('cmdk')) {
              return 'cmdk'
            }
            
            // Input components
            if (id.includes('input-otp')) {
              return 'input-otp'
            }
            if (id.includes('react-day-picker')) {
              return 'date-picker'
            }
            
            // Panels
            if (id.includes('react-resizable-panels')) {
              return 'panels'
            }
            
            // Toast
            if (id.includes('sonner')) {
              return 'toast'
            }
            
            // Drawer
            if (id.includes('vaul')) {
              return 'drawer'
            }
            
            // Everything else - split by first level
            const packageName = id.split('node_modules/')[1]?.split('/')[0]
            if (packageName) {
              return `vendor-${packageName.replace(/[^a-zA-Z0-9]/g, '-')}`
            }
            
            return 'vendor-misc'
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
    include: ['react', 'react-dom'],
    exclude: ['@googlemaps/js-api-loader', 'recharts']
  }
})