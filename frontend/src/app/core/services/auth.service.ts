import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = this.getToken();
    const userJson = localStorage.getItem('shopee_user');
    if (token && userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('shopee_token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: any }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.data.token) {
          localStorage.setItem('shopee_token', response.data.token);
          localStorage.setItem(
            'shopee_user',
            JSON.stringify(response.data.user),
          );
          this.currentUserSubject.next(response.data.user);
        }
      }),
    );
  }

  logout() {
    localStorage.removeItem('shopee_token');
    localStorage.removeItem('shopee_user');
    this.currentUserSubject.next(null);
  }

  fetchProfile(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() })
      .pipe(
        tap((response) => {
          if (response.success) {
            localStorage.setItem('shopee_user', JSON.stringify(response.data));
            this.currentUserSubject.next(response.data);
          }
        }),
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, code: string, newPassword: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email, code, newPassword });
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return roles.includes(user.role);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
