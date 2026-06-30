import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerName = '';
  activeTab = 'catalog';
  products: any[] = [];
  categories: any[] = [];
  stores: any[] = [];
  orders: any[] = [];
  cart: any[] = [];
  shippingAddress = '';
  successMessage = '';
  errorMessage = '';

  filters = {
    search: '',
    categoryId: '',
    storeId: ''
  };

  selectedStoreForMap: any = null;

  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.customerName = user.profile?.name || user.email;
    }
    this.loadCategories();
    this.loadStores();
    this.loadProducts();
    this.loadPurchaseHistory();
    this.loadCartFromStorage();
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

  // --- CATALOG ACTIONS ---
  loadCategories() {
    this.http.get<any>(`${this.baseUrl}/categories`).subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      }
    });
  }

  loadStores() {
    this.http.get<any>(`${this.baseUrl}/stores`).subscribe({
      next: (res) => {
        if (res.success) this.stores = res.data;
      }
    });
  }

  loadProducts() {
    let url = `${this.baseUrl}/products?`;
    if (this.filters.search) url += `search=${this.filters.search}&`;
    if (this.filters.categoryId) url += `categoryId=${this.filters.categoryId}&`;
    if (this.filters.storeId) url += `storeId=${this.filters.storeId}&`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.success) this.products = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load products'
    });
  }

  viewStoreLocation(store: any) {
    this.selectedStoreForMap = store;
  }

  // --- CART ACTIONS ---
  loadCartFromStorage() {
    const savedCart = localStorage.getItem('shopee_cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

  saveCartToStorage() {
    localStorage.setItem('shopee_cart', JSON.stringify(this.cart));
  }

  addToCart(product: any) {
    const existingIndex = this.cart.findIndex(item => item.productId === product._id);
    if (existingIndex > -1) {
      if (this.cart[existingIndex].quantity < product.stock) {
        this.cart[existingIndex].quantity += 1;
        this.successMessage = `Increased quantity for ${product.name}`;
      } else {
        this.errorMessage = `Cannot add more. Only ${product.stock} in stock.`;
      }
    } else {
      this.cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        imageUrl: product.imageUrl,
        storeName: product.storeId?.name
      });
      this.successMessage = `Added ${product.name} to cart`;
    }
    this.saveCartToStorage();
    this.clearMessages();
  }

  onCartQuantityChanged(index: number) {
    const item = this.cart[index];
    if (item.quantity > item.stock) {
      item.quantity = item.stock;
      alert(`Only ${item.stock} items are in stock.`);
    }
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    this.saveCartToStorage();
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.saveCartToStorage();
  }

  getCartItemsCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // --- CHECKOUT ACTIONS ---
  checkout() {
    if (this.cart.length === 0) return;
    const orderData = {
      items: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      shippingAddress: this.shippingAddress
    };

    this.http.post<any>(`${this.baseUrl}/orders`, orderData, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Order checkout completed successfully! Thank you for purchasing.';
          this.cart = [];
          this.shippingAddress = '';
          this.saveCartToStorage();
          this.loadPurchaseHistory();
          this.loadProducts(); // Reload stocks
          this.activeTab = 'orders';
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to place order'
    });
  }

  // --- PURCHASE HISTORY ACTIONS ---
  loadPurchaseHistory() {
    this.http.get<any>(`${this.baseUrl}/orders/my-orders`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) this.orders = res.data;
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load purchase history'
    });
  }
}
