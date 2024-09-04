import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripeClient = () => {
  const secretKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY!
    : process.env.STRIPE_SECRET_TEST_KEY!;
  
  return new Stripe(secretKey, {
    apiVersion: '2023-08-16',
  });
};

export async function POST(req: Request) {
  const { priceId, userId } = await req.json();

  if (!priceId || !userId) {
    return NextResponse.json({ error: 'Price ID and User ID are required' }, { status: 400 });
  }

  const stripe = getStripeClient();

  try {
    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/get-credits?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/get-credits`;

    console.log('Creating checkout session with:', {
      priceId,
      userId,
      successUrl,
      cancelUrl,
      mode: 'payment',
      paymentMethodTypes: ['card'],
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_creation: 'always',
      metadata: {
        user_id: userId,
      },
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session', details: error }, { status: 500 });
  }
}