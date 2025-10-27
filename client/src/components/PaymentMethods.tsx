import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CreditCard, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Use the globally loaded Stripe from the script tag in index.html
const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const stripePromise = new Promise<any>((resolve) => {
  if (!publicKey) {
    console.error('VITE_STRIPE_PUBLIC_KEY is not set');
    resolve(null);
    return;
  }

  // Wait for Stripe to load from the script tag
  const checkStripe = () => {
    if (window.Stripe) {
      resolve(window.Stripe(publicKey));
    } else {
      setTimeout(checkStripe, 50);
    }
  };
  checkStripe();
});

interface PaymentMethod {
  id: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // Create setup intent
      const response = await apiRequest('POST', '/api/stripe/create-setup-intent', {});
      const { clientSecret } = await response.json();

      // Get card element
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm card setup
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent?.status === 'succeeded') {
        toast({
          title: 'Success',
          description: 'Payment method added successfully',
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add payment method',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: 'hsl(var(--foreground))',
                '::placeholder': {
                  color: 'hsl(var(--muted-foreground))',
                },
              },
            },
          }}
        />
      </div>
      <Button type="submit" disabled={!stripe || isLoading} className="w-full" data-testid="button-add-payment-method">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </>
        )}
      </Button>
    </form>
  );
}

export function PaymentMethods() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch payment methods
  const { data, isLoading } = useQuery<{ paymentMethods: PaymentMethod[] }>({
    queryKey: ['/api/stripe/payment-methods'],
  });

  // Delete payment method mutation
  const deleteMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      await apiRequest(`/api/stripe/payment-methods/${paymentMethodId}`, 'DELETE', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/payment-methods'] });
      toast({
        title: 'Success',
        description: 'Payment method removed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove payment method',
        variant: 'destructive',
      });
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      await apiRequest(`/api/stripe/payment-methods/${paymentMethodId}/set-default`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/payment-methods'] });
      toast({
        title: 'Success',
        description: 'Default payment method updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update default payment method',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }
    deleteMutation.mutate(paymentMethodId);
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setDefaultMutation.mutate(paymentMethodId);
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/stripe/payment-methods'] });
  };

  const paymentMethods = data?.paymentMethods || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-open-add-payment-method">
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>Add a new credit or debit card</DialogDescription>
              </DialogHeader>
              <Elements stripe={stripePromise}>
                <AddPaymentMethodForm onSuccess={handleAddSuccess} />
              </Elements>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No payment methods saved</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                data-testid={`card-payment-method-${method.last4}`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{method.brand || 'Card'}</span>
                      <span className="text-muted-foreground">•••• {method.last4}</span>
                      {method.isDefault && (
                        <Badge variant="secondary" className="ml-2" data-testid="badge-default">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={setDefaultMutation.isPending}
                      data-testid={`button-set-default-${method.last4}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${method.last4}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
