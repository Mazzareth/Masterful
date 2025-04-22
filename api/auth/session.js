import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to use environment variables first
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    } else {
      // Fallback to service account file if available
      try {
        const serviceAccount = require('../../firebase-service-account.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } catch (fileError) {
        console.error('Error loading service account file:', fileError);
        
        // Last resort - use default project ID
        admin.initializeApp({
          projectId: 'masterworks-7a904'
        });
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

/**
 * Get the user session from the request
 * @param {Object} req - The request object
 * @returns {Object|null} The user session or null if not authenticated
 */
export async function getSession(req) {
  try {
    // Get the token from the cookie or Authorization header
    const cookies = parse(req.headers.cookie || '');
    let token = cookies.token;
    
    // If no token in cookie, check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      console.log('No token found in request');
      return null;
    }
    
    try {
      // First try to verify as a Firebase token
      const decodedFirebase = await admin.auth().verifyIdToken(token);
      console.log('Firebase token verified:', decodedFirebase);
      
      return {
        id: decodedFirebase.uid,
        email: decodedFirebase.email,
        role: decodedFirebase.role || 'user'
      };
    } catch (firebaseError) {
      console.log('Not a valid Firebase token, trying JWT:', firebaseError.message);
      
      // If not a Firebase token, try as a regular JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}