import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const getStripeClient = (isLiveMode: boolean) => {
  const secretKey = isLiveMode ? process.env.STRIPE_SECRET_KEY! : process.env.STRIPE_SECRET_TEST_KEY!;
  return new Stripe(secretKey, { apiVersion: '2023-10-16' });
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {

  console.log('Received webhook request');
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  console.log('Webhook body:', body);
  console.log('Stripe-Signature:', signature);

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient(false); // Use test mode for initial construction
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Successfully constructed Stripe event:', event.type);
  } catch (err: any) {
    console.error('Error constructing Stripe event:', err);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Processing ${event.type} event in ${event.livemode ? 'live' : 'test'} mode`);

  const stripe = getStripeClient(event.livemode);

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      console.log('Checkout session:', session);
      console.log('Line items:', lineItems);

      for (const item of lineItems.data) {
        const product = await stripe.products.retrieve(item.price?.product as string);
        const creditsToAdd = parseInt(product.name.split(' ')[0]); // Assumes product name starts with number of credits

        console.log('Product:', product);
        console.log('Credits to add:', creditsToAdd);

        // Get the user ID from Stripe customer metadata
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.user_id;

        console.log('Customer:', customer);
        console.log('User ID:', userId);

        if (!userId) {
          console.error('User ID not found in Stripe customer metadata');
          return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
        }

        // Add credits to the user's account
        const { data, error } = await supabase
          .from('credits')
          .upsert(
            { 
              user_id: userId, 
              credits: creditsToAdd 
            },
            { 
              onConflict: 'user_id',
              update: { credits: supabase.raw(`credits + ${creditsToAdd}`) }
            }
          );

        if (error) {
          console.error('Error adding credits:', error);
          return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
        }

        console.log(`Added ${creditsToAdd} credits to user ${userId}`);
      }
    } catch (error) {
      console.error('Error processing checkout.session.completed event:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}