import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseAdmin';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
}

export async function POST(request: Request) {
  try {
    // Dynamically import Stripe
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    // Get the authorization token from the request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the Firebase token
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'ClearCare Pro Subscription',
                description: 'Monthly subscription to ClearCare Pro features',
              },
              unit_amount: 499, // $4.99 in cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        client_reference_id: userId,
        metadata: {
          firebaseUID: userId,
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (verificationError: any) {
      console.error('Token verification or Stripe error:', verificationError.message);
      return NextResponse.json(
        { error: verificationError.message || 'Authentication failed or Stripe configuration error' },
        { status: 403 }
      );
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 