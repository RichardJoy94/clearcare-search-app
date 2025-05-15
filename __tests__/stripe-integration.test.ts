import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'test_session_id',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { firebaseUID: 'test_user_id' },
            subscription: 'sub_123',
          },
        },
      }),
    },
  }));
});

// Mock Firebase Admin
jest.mock('@/lib/firebaseAdmin', () => ({
  auth: {
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test_user_id' }),
  },
  db: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue(true),
      }),
    }),
  },
}));

describe('Stripe Integration', () => {
  let mockRequest: Request;
  
  beforeEach(() => {
    mockRequest = new Request('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test_token',
      },
    });
  });

  describe('Create Checkout Session', () => {
    it('should create a checkout session successfully', async () => {
      const { POST } = require('@/app/api/create-checkout-session/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response).toBeInstanceOf(NextResponse);
      expect(data).toHaveProperty('sessionId', 'test_session_id');
      expect(data).toHaveProperty('url', 'https://checkout.stripe.com/test');
    });

    it('should handle unauthorized requests', async () => {
      const unauthorizedRequest = new Request('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
      });

      const { POST } = require('@/app/api/create-checkout-session/route');
      const response = await POST(unauthorizedRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('Webhook Handler', () => {
    it('should process successful checkout completion', async () => {
      const mockWebhookRequest = new Request('http://localhost:3000/api/stripe-webhook', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test_signature',
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              metadata: { firebaseUID: 'test_user_id' },
              subscription: 'sub_123',
            },
          },
        }),
      });

      const { POST } = require('@/app/api/stripe-webhook/route');
      const response = await POST(mockWebhookRequest);
      const data = await response.json();

      expect(response).toBeInstanceOf(NextResponse);
      expect(data).toHaveProperty('received', true);
    });
  });
}); 