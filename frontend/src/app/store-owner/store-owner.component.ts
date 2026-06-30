import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-store-owner',
  templateUrl: './store-owner.component.html',
  styleUrls: ['./store-owner.component.css']
})
export class StoreOwnerComponent implements OnInit {
  sellerEmail = '';
  myStore: any = null;
  activeTab = 'products';
  products: any[] = [];
  categories: any[] = [];
  orders: any[] = [];
  successMessage = '';
  errorMessage = '';

  newStoreData = {
    name: '',
    description: '',
    location: {
      lat: 14.5995,
      lng: 120.9842,
      address: ''
    }
  };

  productForm = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    imageUrl: ''
  };

  editingProductId: string | null = null;
  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.sellerEmail = user.email;
    }
    this.loadMyStore();
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

  // --- MAP CALLBACK ---
  onLocationSelected(coords: { lat: number; lng: number }) {
    this.newStoreData.location.lat = coords.lat;
    this.newStoreData.location.lng = coords.lng;
  }

  // --- STORE ACTIONS ---
  loadMyStore() {
    this.http.get<any>(`${this.baseUrl}/stores/my-store`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.myStore = res.data;
          if (this.myStore.status === 'approved' && !this.myStore.isDeactivated) {
            this.loadProducts();
            this.loadOrders();
          }
        }
      },
      error: (err) => {
        // 404 means no store yet, which is expected for new sellers
        if (err.status !== 404) {
          this.errorMessage = err.error?.message || 'Failed to check store status';
        }
      }
    });
  }

  applyForStore() {
    this.http.post<any>(`${this.baseUrl}/stores`, this.newStoreData, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Store application submitted successfully!';
          this.myStore = res.data;
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to submit store application'
    });
  }

  // --- CATEGORIES ACTIONS ---
  loadCategories() {
    this.http.get<any>(`${this.baseUrl}/categories`).subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      }
    });
  }

  // --- PRODUCTS ACTIONS ---
  loadProducts() {
    this.http.get<any>(`${this.baseUrl}/products/my-store`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) this.products = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load products'
    });
  }

  saveProduct() {
    if (this.editingProductId) {
      // Edit mode
      this.http.put<any>(`${this.baseUrl}/products/${this.editingProductId}`, this.productForm, { headers: this.authService.getAuthHeaders() }).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Product updated successfully!';
            this.cancelEdit();
            this.loadProducts();
            this.clearMessages();
          }
        },
        error: (err) => this.errorMessage = err.error?.message || 'Failed to update product'
      });
    } else {
      // Create mode
      this.http.post<any>(`${this.baseUrl}/products`, this.productForm, { headers: this.authService.getAuthHeaders() }).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Product added successfully!';
            this.resetProductForm();
            this.loadProducts();
            this.clearMessages();
          }
        },
        error: (err) => this.errorMessage = err.error?.message || 'Failed to add product'
      });
    }
  }

  editProduct(prod: any) {
    this.editingProductId = prod._id;
    this.productForm = {
      name: prod.name,
      description: prod.description,
      price: prod.price,
      stock: prod.stock,
      categoryId: prod.categoryId?._id || prod.categoryId,
      imageUrl: prod.imageUrl || ''
    };
  }

  cancelEdit() {
    this.editingProductId = null;
    this.resetProductForm();
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete<any>(`${this.baseUrl}/products/${id}`, { headers: this.authService.getAuthHeaders() }).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Product deleted.';
            this.loadProducts();
            this.clearMessages();
          }
        },
        error: (err) => this.errorMessage = err.error?.message || 'Failed to delete product'
      });
    }
  }

  private resetProductForm() {
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      imageUrl: ''
    };
  }

  // --- ORDERS ACTIONS ---
  loadOrders() {
    this.http.get<any>(`${this.baseUrl}/orders/store-orders`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) this.orders = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load store orders'
    });
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    this.http.patch<any>(`${this.baseUrl}/orders/${orderId}/status`, { status: newStatus }, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = `Order status updated to ${newStatus}`;
          this.loadOrders();
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to update order status'
    });
  }
}
