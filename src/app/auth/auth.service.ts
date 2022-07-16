import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthData } from './auth-data.model';

const BACKEND_URL: string = environment.apiURL + '/user/';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}
  token: string = '';
  tokenStatusListener = new Subject<boolean>();
  isAuthenticated = false;
  tokenTimer: any;
  userId: string = '';
  getUserId() {
    return this.userId;
  }
  getToken() {
    return this.token;
  }
  getTokenStatus() {
    return this.tokenStatusListener.asObservable();
  }
  getIsAuth() {
    return this.isAuthenticated;
  }
  createUser(email: string, password: string) {
    const user: AuthData = { email: email, password: password };
    this.http.post(BACKEND_URL + 'signup', user).subscribe(
      (res) => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.tokenStatusListener.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const user: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        BACKEND_URL + 'login',
        user
      )
      .subscribe(
        (res) => {
          this.token = res.token;
          if (!!res.token) {
            this.isAuthenticated = true;
            this.userId = res.userId;
            const expiresIn = res.expiresIn;
            this.setAuthTimer(expiresIn);
            this.tokenStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresIn * 1000);
            this.saveAuthData(this.token, expirationDate, this.userId);
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.tokenStatusListener.next(false);
        }
      );
  }

  logout() {
    this.token = '';
    this.isAuthenticated = false;
    this.userId = '';
    this.tokenStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  autoAuthUser() {
    const auth = this.getAuthData();
    if (!!auth) {
      const now = new Date();
      const expiresIn = auth.expirationDate.getTime() - now.getTime();
      if (expiresIn > 0) {
        this.token = auth.token;
        this.isAuthenticated = true;
        this.userId = auth.userId;
        this.setAuthTimer(expiresIn / 1000);
        this.tokenStatusListener.next(true);
      }
    }
  }

  setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate || !userId) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }
}
