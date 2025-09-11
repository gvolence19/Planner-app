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
    // Less aggressive settings for Heroku
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    sourcemap: false,
    reportCompressedSize: false,
    target: 'es2015', // More compatible target
    
    // Higher chunk size limits to reduce splitting
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      maxParallelFileOps: 1, // Reduce parallel operations for memory
      
      output: {
        // Much simpler chunk splitting
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Group React ecosystem together
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor'
            }
            
            // Group all Radix UI components together
            if (id.includes('@radix-ui')) {
              return 'radix-ui'
            }
            
            // Group large libraries
            if (id.includes('recharts')) {
              return 'charts'
            }
            
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            
            // Everything else in vendor
            return 'vendor'
          }
          
          // App code - minimal splitting
          if (id.includes('src/components/ui/')) {
            return 'ui-components'
          }
          
          if (id.includes('src/')) {
            return 'app'
          }
        },
        
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]'
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Remove problematic excludes
  }
})