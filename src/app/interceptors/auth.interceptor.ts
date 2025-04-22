import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpEvent
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Auth, getIdToken } from '@angular/fire/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const user = auth.currentUser;
  
  // Only add token for API requests
  if (!req.url.includes('/api/')) {
    return next(req);
  }
  
  // If no user is logged in, proceed without token
  if (!user) {
    return next(req);
  }
  
  // Get the token and add it to the request
  return from(getIdToken(user)).pipe(
    switchMap(token => {
      // Set the token as a cookie
      document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;
      
      // Clone the request and add the token to the headers as well (as a backup)
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      return next(authReq);
    })
  );
};