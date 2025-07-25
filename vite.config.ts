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
    // Memory optimization settings
    minify: 'esbuild', // Faster and uses less memory than terser
    sourcemap: false, // Disable sourcemaps to save memory
    reportCompressedSize: false, // Skip size reporting to save memory
    target: 'esnext',
    
    // Chunk size settings
    chunkSizeWarningLimit: 300, // Lower warning threshold
    
    rollupOptions: {
      // Memory optimization
      maxParallelFileOps: 2, // Reduce parallel operations
      
      output: {
        // Strategic chunk splitting to keep sizes under 300KB
        manualChunks: (id) => {
          // Vendor libraries - split into smaller, focused chunks
          if (id.includes('node_modules')) {
            
            // React core (small, frequently used)
            if (id.includes('react') && !id.includes('react-router')) {
              return 'react-core'
            }
            if (id.includes('react-dom')) {
              return 'react-dom'
            }
            if (id.includes('react-router')) {
              return 'react-router'
            }
            
            // UI components - split Radix into smaller chunks
            if (id.includes('@radix-ui/react-dialog') || 
                id.includes('@radix-ui/react-alert-dialog') ||
                id.includes('@radix-ui/react-popover')) {
              return 'radix-overlay'
            }
            if (id.includes('@radix-ui/react-select') || 
                id.includes('@radix-ui/react-dropdown-menu') ||
                id.includes('@radix-ui/react-menubar')) {
              return 'radix-menu'
            }
            if (id.includes('@radix-ui/react-accordion') || 
                id.includes('@radix-ui/react-collapsible') ||
                id.includes('@radix-ui/react-tabs')) {
              return 'radix-layout'
            }
            if (id.includes('@radix-ui')) {
              return 'radix-other'
            }
            
            // Form handling
            if (id.includes('react-hook-form') || 
                id.includes('@hookform/resolvers') || 
                id.includes('zod')) {
              return 'form'
            }
            
            // Charts (potentially large)
            if (id.includes('recharts')) {
              return 'charts'
            }
            
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-utils'
            }
            
            // Google Maps (potentially large)
            if (id.includes('@googlemaps')) {
              return 'maps'
            }
            
            // Styling utilities (small)
            if (id.includes('clsx') || 
                id.includes('tailwind-merge') || 
                id.includes('class-variance-authority')) {
              return 'style-utils'
            }
            
            // Everything else
            return 'vendor'
          }
          
          // App code chunking by feature/route
          if (id.includes('src/components')) {
            return 'components'
          }
          if (id.includes('src/pages')) {
            return 'pages'
          }
          if (id.includes('src/lib')) {
            return 'lib'
          }
        },
        
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
          return `js/[name]-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  
  // Optimize dependencies preprocessing
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    exclude: [
      // Exclude large libraries from pre-bundling to save memory
      '@googlemaps/js-api-loader',
      'recharts'
    ]
  }
})