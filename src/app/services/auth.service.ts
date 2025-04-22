import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  UserCredential,
  User,
  onAuthStateChanged,
  onIdTokenChanged,
  authState
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, of, firstValueFrom } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenRefreshInterval: any;
  private authStateReady = false;

  constructor(private auth: Auth) {
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      this.authStateReady = true;
      
      if (user) {
        this.startTokenRefresh();
      } else {
        this.stopTokenRefresh();
        // Clear the token cookie when signed out
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });
    
    // Listen for ID token changes
    onIdTokenChanged(this.auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
    });
  }
  
  // Start token refresh interval (every 55 minutes)
  private startTokenRefresh() {
    this.stopTokenRefresh();
    this.tokenRefreshInterval = setInterval(async () => {
      const user = this.auth.currentUser;
      if (user) {
        try {
          // Force token refresh
          const token = await user.getIdToken(true);
          document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
    }, 55 * 60 * 1000); // 55 minutes
  }
  
  // Stop token refresh interval
  private stopTokenRefresh() {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }

  // Sign in with email and password
  signIn(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  // Sign up with email and password
  signUp(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  // Sign in with Google
  signInWithGoogle(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  // Sign out
  signOut(): Observable<void> {
    // Clear the token cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return from(signOut(this.auth));
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Check if user is authenticated synchronously
  // This is used for quick checks but may not be accurate on page load
  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }
  
  // Check if user is authenticated asynchronously
  // This is more reliable, especially on page load/refresh
  isAuthenticatedAsync(): Observable<boolean> {
    // If auth state is already initialized, we can use the current value
    if (this.authStateReady) {
      return of(!!this.auth.currentUser);
    }
    
    // Otherwise, wait for the auth state to be determined
    return authState(this.auth).pipe(
      take(1),
      map(user => !!user)
    );
  }
}