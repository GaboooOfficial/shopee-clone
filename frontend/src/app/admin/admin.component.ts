import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab = 'stores';
  adminEmail = '';
  pendingStores: any[] = [];
  allStores: any[] = [];
  users: any[] = [];
  categories: any[] = [];
  successMessage = '';
  errorMessage = '';

  newCategory = {
    name: '',
    description: ''
  };

  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const adminUser = this.authService.currentUserValue;
    if (adminUser) {
      this.adminEmail = adminUser.email;
    }
    this.loadPendingStores();
    this.loadAllStores();
    this.loadUsers();
    this.loadCategories();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  private clearMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 4000);
  }

  // --- STORES ACTIONS ---
  loadPendingStores() {
    this.http.get<any>(`${this.baseUrl}/admin/stores/pending`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) this.pendingStores = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load pending stores'
    });
  }

  loadAllStores() {
    this.http.get<any>(`${this.baseUrl}/admin/stores`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) this.allStores = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load stores'
    });
  }

  approveStore(storeId: string) {
    this.http.patch<any>(`${this.baseUrl}/admin/stores/${storeId}/approve`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Store approved successfully!';
          this.loadPendingStores();
          this.loadAllStores();
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to approve store'
    });
  }

  rejectStore(storeId: string) {
    this.http.patch<any>(`${this.baseUrl}/admin/stores/${storeId}/reject`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Store request rejected.';
          this.loadPendingStores();
          this.loadAllStores();
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to reject store'
    });
  }

  toggleStoreActive(storeId: string) {
    this.http.patch<any>(`${this.baseUrl}/admin/stores/${storeId}/toggle-active`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = res.message;
          this.loadAllStores();
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to toggle store activity'
    });
  }

  // --- ACCOUNTS ACTIONS ---
  loadUsers() {
    this.http.get<any>(`${this.baseUrl}/admin/users`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) this.users = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load user accounts'
    });
  }

  toggleUserActive(userId: string) {
    this.http.patch<any>(`${this.baseUrl}/admin/users/${userId}/toggle-active`, {}, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = res.message;
          this.loadUsers();
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to toggle account activity'
    });
  }

  // --- CATEGORIES ACTIONS ---
  loadCategories() {
    this.http.get<any>(`${this.baseUrl}/categories`).subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load categories'
    });
  }

  createCategory() {
    this.http.post<any>(`${this.baseUrl}/categories`, this.newCategory, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Category created successfully!';
          this.newCategory = { name: '', description: '' };
          this.loadCategories();
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to create category'
    });
  }
}
