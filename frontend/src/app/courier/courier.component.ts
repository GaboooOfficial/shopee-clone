import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Store } from '@ngrx/store';
import * as OrdersActions from '../store/orders/orders.actions';
import { selectCourierDeliveries } from '../store/orders/orders.selectors';

@Component({
  selector: 'app-courier',
  templateUrl: './courier.component.html',
  styleUrls: ['./courier.component.css']
})
export class CourierComponent implements OnInit {
  courierEmail = '';
  courierName = '';
  activeTab = 'deliveries';
  pendingDeliveries: any[] = [];
  successMessage = '';
  errorMessage = '';

  // Stats
  stats = {
    totalJobs: 0,
    transitJobs: 0,
    deliveredJobs: 0,
    failedJobs: 0
  };

  // Status transition input
  selectedOrderIdForUpdate: string | null = null;
  statusUpdateForm = {
    status: 'intransit',
    notes: ''
  };

  profileForm = {
    name: '',
    phone: ''
  };

  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.courierEmail = user.email;
      this.courierName = user.profile?.name || user.email;
      this.profileForm = {
        name: user.profile?.name || '',
        phone: user.profile?.phone || ''
      };
    }
    this.store.select(selectCourierDeliveries).subscribe(deliveries => {
      this.pendingDeliveries = deliveries;
      this.calculateStats();
    });
    this.loadPendingDeliveries();
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

  loadPendingDeliveries() {
    this.store.dispatch(OrdersActions.loadCourierDeliveries());
  }

  calculateStats() {
    this.stats.totalJobs = this.pendingDeliveries.length;
    this.stats.transitJobs = this.pendingDeliveries.filter(d => d.status === 'intransit').length;
    this.stats.deliveredJobs = this.pendingDeliveries.filter(d => d.status === 'package delivered').length;
    this.stats.failedJobs = this.pendingDeliveries.filter(d => d.status === 'unsuccessful').length;
  }

  openUpdateModal(order: any) {
    this.selectedOrderIdForUpdate = order._id;
    this.statusUpdateForm = {
      status: order.status === 'processing' || order.status === 'shipped' ? 'intransit' : 'package delivered',
      notes: ''
    };
  }

  closeUpdateModal() {
    this.selectedOrderIdForUpdate = null;
  }

  updateDeliveryStatus() {
    if (!this.selectedOrderIdForUpdate) return;

    const payload = {
      status: this.statusUpdateForm.status,
      notes: this.statusUpdateForm.notes
    };

    this.http.patch<any>(`${this.baseUrl}/orders/${this.selectedOrderIdForUpdate}/status`, payload, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = `Delivery status updated to ${this.statusUpdateForm.status}!`;
          this.closeUpdateModal();
          this.loadPendingDeliveries();
          this.clearMessages();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update delivery status';
        this.clearMessages();
      }
    });
  }

  updateProfile() {
    this.http.put<any>(`${this.baseUrl}/auth/profile`, this.profileForm, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Profile updated successfully!';
          const user = this.authService.currentUserValue;
          user.profile = res.data.profile;
          localStorage.setItem('shopee_user', JSON.stringify(user));
          this.courierName = user.profile.name;
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to update profile'
    });
  }

  getProductImageUrl(url: string): string {
    if (!url || !url.trim()) return 'assets/shopee_logo.png';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('assets/')) {
      return trimmed;
    }
    if (trimmed.endsWith('.png') || trimmed.endsWith('.jpg') || trimmed.endsWith('.jpeg') || trimmed.endsWith('.webp')) {
      return 'assets/' + trimmed;
    }
    return 'assets/shopee_logo.png';
  }
}
