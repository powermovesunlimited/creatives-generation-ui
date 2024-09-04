'use client'
import { User } from '@supabase/supabase-js';
import React, { useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface StripePricingTableProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  'pricing-table-id': string;
  'publishable-key': string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': StripePricingTableProps;
    }
  }
}

type Props = {
  user: User;
}

const StripePricingTable = ({ user }: Props) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  const handlePriceClick = useCallback(async (event: Event) => {
    event.preventDefault();
    const priceId = (event.target as HTMLAnchorElement).dataset.priceId;
    
    if (!priceId) {
      console.error('No price ID found');
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (!data.sessionId) {
        throw new Error('No session ID returned from server');
      }

      const publishableKey = process.env.NODE_ENV === 'production'
        ? process.env.STRIPE_PUBLISHABLE_KEY
        : process.env.STRIPE_PUBLISHABLE_TEST_KEY;

      if (!publishableKey) {
        throw new Error('Stripe publishable key is not set');
      }

      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        console.error('Stripe redirectToCheckout error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error during checkout process:', error);
      // Here you might want to show an error message to the user
    }
  }, [user.id]);

  useEffect(() => {
    const pricingTable = document.querySelector('stripe-pricing-table');
    pricingTable?.addEventListener('click', handlePriceClick);

    return () => {
      pricingTable?.removeEventListener('click', handlePriceClick);
    };
  }, [handlePriceClick]);

  const isProduction = process.env.NODE_ENV === 'production';
  const pricingTableId = isProduction
    ? process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_LIVE
    : process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_TEST;
  const publishableKey = isProduction
    ? process.env.STRIPE_PUBLISHABLE_KEY
    : process.env.STRIPE_PUBLISHABLE_TEST_KEY;

  return (
    <div className='flex flex-1 flex-col w-full'>
      <stripe-pricing-table
          pricing-table-id={pricingTableId || ''}
          publishable-key={publishableKey || ''}
          client-reference-id={user.id}
          customer-email={user.email}
      >
      </stripe-pricing-table>
    </div>
  );
}

export default StripePricingTable;
