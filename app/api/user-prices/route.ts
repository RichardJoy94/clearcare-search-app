import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    // Log the database instance
    console.log('Firestore instance:', !!db);

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
      console.log('Missing fields:', missingFields);
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
      console.log('Invalid price:', price);
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
      // Add metadata
      metadata: {
        submissionVersion: '1.0',
        submittedFromPage: 'price-insight',
        submittedAt: new Date().toISOString() // Backup timestamp
      }
    };

    console.log('Attempting to save submission:', priceSubmission);

    try {
      // Verify collection reference
      const userPricesRef = collection(db, 'user-prices');
      console.log('Collection reference created');

      // Add the document
      const docRef = await addDoc(userPricesRef, priceSubmission);
      console.log('Document written with ID:', docRef.id);
      
      return NextResponse.json({ 
        success: true,
        submissionId: docRef.id
      });
    } catch (firestoreError: any) {
      // Detailed Firestore error logging
      console.error('Firestore error details:', {
        code: firestoreError.code,
        message: firestoreError.message,
        stack: firestoreError.stack
      });

      // Return a more specific error message
      return NextResponse.json(
        { 
          error: 'Database error while saving submission',
          details: firestoreError.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // General error logging
    console.error('General error in price submission:', {
      message: error.message,
      stack: error.stack
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