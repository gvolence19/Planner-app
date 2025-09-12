// Purchase Component for iOS In-App Purchases
// File: src/components/PurchaseDialog.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Smartphone, Restore, Loader2 } from 'lucide-react';
import { useStoreKit, Product } from '@/lib/storekit';
import { toast } from 'sonner';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess?: (productId: string) => void;
}

export default function PurchaseDialog({ 
  open, 
  onOpenChange, 
  onPurchaseSuccess 
}: PurchaseDialogProps) {
  const { products, isLoading, error, purchase, restore, isAvailable } = useStoreKit();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  // Handle purchase
  const handlePurchase = async (product: Product) => {
    if (!isAvailable) {
      toast.error('In-app purchases are not available');
      return;
    }

    setPurchasing(product.id);
    try {
      const result = await purchase(product.id);
      
      if (result.success) {
        toast.success(`Successfully purchased ${product.title}!`);
        onPurchaseSuccess?.(product.id);
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Purchase failed');
      }
    } catch (err) {
      toast.error('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  // Handle restore purchases
  const handleRestore = async () => {
    if (!isAvailable) {
      toast.error('In-app purchases are not available');
      return;
    }

    setRestoring(true);
    try {
      const results = await restore();
      
      if (results.length > 0) {
        toast.success(`Restored ${results.length} purchase(s)`);
        results.forEach(result => {
          if (result.success && result.productId) {
            onPurchaseSuccess?.(result.productId);
          }
        });
        onOpenChange(false);
      } else {
        toast.info('No purchases to restore');
      }
    } catch (err) {
      toast.error('Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  if (!isAvailable) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>In-App Purchases</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Smartphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              In-app purchases are only available in the iOS app.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Experience</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading products...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No products available</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.description}
                      </p>
                      <Badge variant="secondary" className="mb-3">
                        {product.price} {product.currencyCode}
                      </Badge>
                    </div>
                  </div>

                  {/* Feature list based on product ID */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 gap-2">
                      {getProductFeatures(product.id).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handlePurchase(product)}
                    disabled={purchasing === product.id || restoring}
                  >
                    {purchasing === product.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Purchasing...
                      </>
                    ) : (
                      `Purchase for ${product.price}`
                    )}
                  </Button>
                </div>
              ))
            )}

            {/* Restore Purchases Button */}
            <div className="border-t pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleRestore}
                disabled={restoring || purchasing !== null}
              >
                {restoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Restore className="mr-2 h-4 w-4" />
                    Restore Purchases
                  </>
                )}
              </Button>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>
                By purchasing, you agree to our{' '}
                <a href="#" className="underline">Terms of Service</a> and{' '}
                <a href="#" className="underline">Privacy Policy</a>
              </p>
              <p>
                Subscriptions auto-renew unless cancelled 24 hours before renewal.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get features based on product ID
function getProductFeatures(productId: string): string[] {
  switch (productId) {
    case 'com.yourapp.premium.monthly':
    case 'com.yourapp.premium.yearly':
      return [
        'Unlimited tasks and categories',
        'Advanced task scheduling',
        'Priority customer support',
        'Cloud backup and sync',
        'Advanced analytics',
        'Custom themes'
      ];
    case 'com.yourapp.remove.ads':
      return [
        'Remove all advertisements',
        'Cleaner interface',
        'Faster app performance'
      ];
    default:
      return ['Premium features'];
  }
}