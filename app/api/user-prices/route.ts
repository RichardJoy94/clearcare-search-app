import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const data = await request.json();
    console.log('Received data:', data);
    
    // Enhanced validation with specific error messages
    const requiredFields = {
      providerName: 'Provider name',
      pricePaid: 'Price paid',
      insuranceStatus: 'Insurance status',
      serviceName: 'Service name'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !data[key])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    const price = Number(data.pricePaid);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Format data for submission
    const priceSubmission = {
      ...data,
      pricePaid: price,
      submittedAt: serverTimestamp(),
      metadata: {
        submissionVersion: '1.0',
        submittedFromPage: 'price-insight',
        submittedAt: new Date().toISOString()
      }
    };

    // Add the document
    const userPricesRef = collection(db, 'user-prices');
    const docRef = await addDoc(userPricesRef, priceSubmission);
    
    return NextResponse.json({ 
      success: true,
      submissionId: docRef.id
    });

  } catch (error: any) {
    console.error('Error in price submission:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    return NextResponse.json(
      { 
        error: 'Failed to process price submission',
        details: error.message
      },
      { status: 500 }
    );
  }
} 