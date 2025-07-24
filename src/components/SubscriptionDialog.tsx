import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import AnimatedGradientText from './AnimatedGradientText';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { plan, isPremium, upgradeToPremium, cancelPremium } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscriptionAction = async () => {
    try {
      setIsLoading(true);
      if (isPremium) {
        await cancelPremium();
      } else {
        await upgradeToPremium();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Subscription action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <AnimatedGradientText text="Subscription Plans" className="text-2xl font-bold" />
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose the plan that works best for you
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Free Plan */}
          <div className={`border rounded-lg p-4 ${plan === 'free' ? 'ring-2 ring-primary' : ''}`}>
            <h3 className="font-semibold text-lg mb-2">Free Plan</h3>
            <p className="text-sm text-muted-foreground mb-4">Basic task management</p>
            <p className="text-2xl font-bold mb-4">$0<span className="text-sm font-normal">/month</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Up to 10 tasks</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">2 basic categories</span>
              </li>
              <li className="flex items-center">
                <X className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm text-muted-foreground">Calendar integration</span>
              </li>
              <li className="flex items-center">
                <X className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm text-muted-foreground">Priority support</span>
              </li>
            </ul>
            {isPremium && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleSubscriptionAction}
                disabled={isLoading}
              >
                Downgrade to Free
              </Button>
            )}
          </div>
          
          {/* Premium Plan */}
          <div className={`border rounded-lg p-4 ${plan === 'premium' ? 'ring-2 ring-primary' : ''}`}>
            <h3 className="font-semibold text-lg mb-2">Premium Plan</h3>
            <p className="text-sm text-muted-foreground mb-4">Advanced features</p>
            <p className="text-2xl font-bold mb-4">$5<span className="text-sm font-normal">/month</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Unlimited tasks</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Unlimited custom categories</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Calendar integration</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            {!isPremium && (
              <Button 
                className="w-full"
                onClick={handleSubscriptionAction}
                disabled={isLoading}
              >
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}