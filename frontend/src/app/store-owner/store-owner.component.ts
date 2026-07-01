import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-store-owner',
  templateUrl: './store-owner.component.html',
  styleUrls: ['./store-owner.component.css']
})
export class StoreOwnerComponent implements OnInit, OnDestroy {
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

  storeSettings = {
    name: '',
    description: '',
    location: {
      lat: 14.5995,
      lng: 120.9842,
      address: ''
    }
  };

  chats: any[] = [];
  selectedChat: any = null;
  chatMessages: any[] = [];
  newMessageText = '';
  currentUserId = '';
  private socket: WebSocket | null = null;

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
      this.currentUserId = user._id || '';
      this.initWebSocket();
    }
    this.loadMyStore();
    this.loadCategories();
  }

  logout() {
    if (this.socket) {
      this.socket.close();
    }
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
          // Populate settings form
          this.storeSettings = {
            name: this.myStore.name || '',
            description: this.myStore.description || '',
            location: {
              lat: this.myStore.location?.lat || 14.5995,
              lng: this.myStore.location?.lng || 120.9842,
              address: this.myStore.location?.address || ''
            }
          };
          if (this.myStore.status === 'approved' && !this.myStore.isDeactivated) {
            this.loadProducts();
            this.loadOrders();
            this.loadChats();
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
    if (!this.productForm.categoryId) {
      this.errorMessage = 'Please select a valid category.';
      this.clearMessages();
      return;
    }
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

  // --- SETTINGS ACTIONS ---
  onSettingsLocationSelected(coords: { lat: number; lng: number }) {
    this.storeSettings.location.lat = coords.lat;
    this.storeSettings.location.lng = coords.lng;
  }

  updateStoreSettings() {
    this.http.put<any>(`${this.baseUrl}/stores/${this.myStore._id}`, this.storeSettings, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Store settings updated successfully!';
          this.myStore = res.data;
          this.clearMessages();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to update store settings'
    });
  }

  // --- MESSAGING ACTIONS ---
  loadChats() {
    this.http.get<any>(`${this.baseUrl}/messages/conversations`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.chats = res.data;
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load conversations'
    });
  }

  selectChat(chat: any) {
    this.selectedChat = chat;
    this.loadMessages(chat.otherUser._id);
  }

  loadMessages(otherUserId: string) {
    this.http.get<any>(`${this.baseUrl}/messages/conversation/${otherUserId}`, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.chatMessages = res.data;
          // Mark the chat's last message as read locally
          if (this.selectedChat) {
            this.selectedChat.lastMessage.isRead = true;
          }
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load messages'
    });
  }

  sendChatMessage() {
    if (!this.newMessageText.trim() || !this.selectedChat) return;

    const payload = {
      receiverId: this.selectedChat.otherUser._id,
      content: this.newMessageText
    };

    this.http.post<any>(`${this.baseUrl}/messages`, payload, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.chatMessages.push(res.data);
          this.newMessageText = '';
          // Refresh conversation list to get latest messages
          this.loadChats();
        }
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to send message'
    });
  }

  // --- WEBSOCKET ACTIONS ---
  initWebSocket() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = new WebSocket(`ws://localhost:3000?userId=${this.currentUserId}`);

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new_message') {
          const message = payload.data;
          if (this.selectedChat && (message.senderId._id === this.selectedChat.otherUser._id || message.senderId === this.selectedChat.otherUser._id)) {
            this.chatMessages.push(message);
          }
          this.loadChats();
        }
      } catch (e) {
        console.error('Error handling WebSocket message:', e);
      }
    };

    this.socket.onclose = () => {
      console.log('🔌 WebSocket connection closed.');
    };
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }
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
