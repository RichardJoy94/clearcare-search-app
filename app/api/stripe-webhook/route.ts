import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/firebaseAdmin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
}

export async function POST(request: Request) {
  try {
    // Dynamically import Stripe
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: !signature ? 'No signature found' : 'Webhook secret not configured' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.firebaseUID;

      if (!userId) {
        console.error('No Firebase UID found in session metadata');
        return NextResponse.json({ error: 'No user ID' }, { status: 400 });
      }

      // Update user's pro status in Firestore
      await db.collection('users').doc(userId).update({
        isPro: true,
        proSubscriptionId: session.subscription,
        proSubscriptionStatus: 'active',
        proSubscriptionStart: new Date().toISOString(),
      });

      return NextResponse.json({ received: true });
    }

    // Handle subscription cancellation/failure if needed
    if (event.type === 'customer.subscription.deleted' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.firebaseUID;

      if (userId) {
        await db.collection('users').doc(userId).update({
          isPro: subscription.status === 'active',
          proSubscriptionStatus: subscription.status,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 