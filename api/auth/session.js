import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

/**
 * Get the user session from the request
 * @param {Object} req - The request object
 * @returns {Object|null} The user session or null if not authenticated
 */
export async function getSession(req) {
  try {
    // Get the token from the cookie
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;
    
    if (!token) {
      return null;
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}