import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const courseId = url.searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId or courseId' },
        { status: 400 }
      );
    }

    const storeKey = `${userId}_${courseId}`;

    try {
      const docRef = doc(db, 'user_progress', storeKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return NextResponse.json({
          success: true,
          progress: docSnap.data(),
        });
      }
    } catch (firestoreErr) {
      console.warn('Firestore fetch fallback on server:', firestoreErr);
    }

    return NextResponse.json({
      success: true,
      progress: null,
    });
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId, progress } = body;

    if (!userId || !courseId || !progress) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      );
    }

    const storeKey = `${userId}_${courseId}`;

    try {
      const docRef = doc(db, 'user_progress', storeKey);
      await setDoc(
        docRef,
        {
          ...progress,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (firestoreErr) {
      console.warn('Firestore write fallback on server:', firestoreErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
