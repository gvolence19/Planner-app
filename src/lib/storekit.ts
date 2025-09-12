// StoreKit Integration for iOS In-App Purchases
// File: src/lib/storekit.ts

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        storeKit?: {
          postMessage: (message: any) => void;
        };
      };
    };
  }
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceLocale: string;
  currencyCode: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}

export interface StoreKitEvent {
  type: 'productsLoaded' | 'purchaseCompleted' | 'purchaseFailed' | 'purchaseRestored';
  data?: any;
}

class StoreKitManager {
  private eventListeners: { [key: string]: ((event: StoreKitEvent) => void)[] } = {};
  private products: Product[] = [];
  private isAvailable: boolean = false;

  constructor() {
    this.checkAvailability();
    this.setupEventListeners();
  }

  private checkAvailability(): void {
    // Check if we're in an iOS WebView with StoreKit support
    this.isAvailable = !!(
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.storeKit
    );
    
    console.log('StoreKit availability:', this.isAvailable);
  }

  private setupEventListeners(): void {
    // Listen for messages from native iOS app
    window.addEventListener('message', (event) => {
      if (event.data && event.data.source === 'storekit') {
        this.handleStoreKitEvent(event.data);
      }
    });
  }

  private handleStoreKitEvent(data: any): void {
    const event: StoreKitEvent = {
      type: data.type,
      data: data.payload
    };

    switch (event.type) {
      case 'productsLoaded':
        this.products = event.data || [];
        break;
      case 'purchaseCompleted':
        // Handle successful purchase
        break;
      case 'purchaseFailed':
        // Handle failed purchase
        break;
      case 'purchaseRestored':
        // Handle restored purchase
        break;
    }

    // Notify listeners
    this.emit(event.type, event);
  }

  public on(eventType: string, callback: (event: StoreKitEvent) => void): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
  }

  public off(eventType: string, callback: (event: StoreKitEvent) => void): void {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType] = this.eventListeners[eventType].filter(cb => cb !== callback);
    }
  }

  private emit(eventType: string, event: StoreKitEvent): void {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach(callback => callback(event));
    }
  }

  public async loadProducts(productIds: string[]): Promise<Product[]> {
    if (!this.isAvailable) {
      throw new Error('StoreKit is not available');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout loading products'));
      }, 10000);

      this.on('productsLoaded', (event) => {
        clearTimeout(timeoutId);
        resolve(event.data || []);
      });

      // Send message to native iOS app
      window.webkit!.messageHandlers!.storeKit!.postMessage({
        action: 'loadProducts',
        productIds: productIds
      });
    });
  }

  public async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isAvailable) {
      throw new Error('StoreKit is not available');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout during purchase'));
      }, 30000);

      const handlePurchaseCompleted = (event: StoreKitEvent) => {
        clearTimeout(timeoutId);
        this.off('purchaseCompleted', handlePurchaseCompleted);
        this.off('purchaseFailed', handlePurchaseFailed);
        resolve({
          success: true,
          productId: event.data.productId,
          transactionId: event.data.transactionId
        });
      };

      const handlePurchaseFailed = (event: StoreKitEvent) => {
        clearTimeout(timeoutId);
        this.off('purchaseCompleted', handlePurchaseCompleted);
        this.off('purchaseFailed', handlePurchaseFailed);
        resolve({
          success: false,
          error: event.data.error || 'Purchase failed'
        });
      };

      this.on('purchaseCompleted', handlePurchaseCompleted);
      this.on('purchaseFailed', handlePurchaseFailed);

      // Send purchase message to native iOS app
      window.webkit!.messageHandlers!.storeKit!.postMessage({
        action: 'purchaseProduct',
        productId: productId
      });
    });
  }

  public async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isAvailable) {
      throw new Error('StoreKit is not available');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout restoring purchases'));
      }, 15000);

      this.on('purchaseRestored', (event) => {
        clearTimeout(timeoutId);
        resolve(event.data || []);
      });

      // Send restore message to native iOS app
      window.webkit!.messageHandlers!.storeKit!.postMessage({
        action: 'restorePurchases'
      });
    });
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public isStoreKitAvailable(): boolean {
    return this.isAvailable;
  }
}

// Export singleton instance
export const storeKit = new StoreKitManager();

// Hook for React components
import { useState, useEffect } from 'react';

export function useStoreKit() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load products when component mounts
    const loadProducts = async () => {
      if (!storeKit.isStoreKitAvailable()) {
        setError('StoreKit not available');
        return;
      }

      setIsLoading(true);
      try {
        // Define your App Store Connect product IDs here
        const productIds = [
          'com.yourapp.premium.monthly',
          'com.yourapp.premium.yearly',
          'com.yourapp.remove.ads'
        ];
        
        const loadedProducts = await storeKit.loadProducts(productIds);
        setProducts(loadedProducts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const purchase = async (productId: string): Promise<PurchaseResult> => {
    setIsLoading(true);
    try {
      const result = await storeKit.purchaseProduct(productId);
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Purchase failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const restore = async (): Promise<PurchaseResult[]> => {
    setIsLoading(true);
    try {
      const results = await storeKit.restorePurchases();
      setError(null);
      return results;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Restore failed';
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    error,
    purchase,
    restore,
    isAvailable: storeKit.isStoreKitAvailable()
  };
}