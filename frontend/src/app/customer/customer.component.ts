import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Store } from '@ngrx/store';
import * as CartActions from '../store/cart/cart.actions';
import { selectCartItems } from '../store/cart/cart.selectors';
import * as ProductsActions from '../store/products/products.actions';
import { selectProducts } from '../store/products/products.selectors';
import * as OrdersActions from '../store/orders/orders.actions';
import { selectCustomerOrders } from '../store/orders/orders.selectors';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent implements OnInit, OnDestroy {
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
    storeId: '',
  };

  selectedStoreForMap: any = null;

  chats: any[] = [];
  selectedChat: any = null;
  chatMessages: any[] = [];
  newMessageText = '';
  currentUserId = '';
  profileForm = {
    name: '',
    phone: '',
  };
  editingOrderAddressId: string | null = null;
  newOrderAddressText = '';
  private socket: WebSocket | null = null;

  // Order tracking modal
  trackingModalOrder: any = null;

  // Review modal variables
  reviewModalOpen = false;
  reviewProductName = '';
  reviewForm = {
    productId: '',
    orderId: '',
    rating: 5,
    reviewText: ''
  };

  // Product reviews drawer
  selectedProductForReviews: any = null;
  selectedProductReviews: any[] = [];

  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private store: Store,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.customerName = user.profile?.name || user.email;
      this.currentUserId = user._id || user.id || '';
      this.profileForm = {
        name: user.profile?.name || '',
        phone: user.profile?.phone || '',
      };
      this.initWebSocket();
    }
    this.store.select(selectCartItems).subscribe(items => this.cart = items);
    this.store.select(selectProducts).subscribe(products => this.products = products);
    this.store.select(selectCustomerOrders).subscribe(orders => this.orders = orders);

    this.loadCategories();
    this.loadStores();
    this.loadProducts();
    this.loadPurchaseHistory();
    this.loadCartFromStorage();
    this.loadChats();
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

  // --- CATALOG ACTIONS ---
  loadCategories() {
    this.http.get<any>(`${this.baseUrl}/categories`).subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      },
    });
  }

  loadStores() {
    this.http.get<any>(`${this.baseUrl}/stores`).subscribe({
      next: (res) => {
        if (res.success) this.stores = res.data;
      },
    });
  }

  loadProducts() {
    this.store.dispatch(
      ProductsActions.loadProducts({
        search: this.filters.search,
        categoryId: this.filters.categoryId,
        storeId: this.filters.storeId,
      })
    );
  }

  viewStoreLocation(store: any) {
    this.selectedStoreForMap = store;
  }

  // --- CART ACTIONS ---
  loadCartFromStorage() {
    this.store.dispatch(CartActions.loadCartFromStorage());
  }

  saveCartToStorage() {
    // Handled automatically by reducer/localstorage sync
  }

  addToCart(product: any) {
    this.store.dispatch(CartActions.addToCart({ product }));
    this.successMessage = `Added ${product.name} to cart`;
    this.clearMessages();
  }

  onCartQuantityChanged(index: number, newQty: number) {
    this.store.dispatch(CartActions.updateCartQuantity({ index, quantity: newQty }));
  }

  removeFromCart(index: number) {
    this.store.dispatch(CartActions.removeFromCart({ index }));
  }

  getCartItemsCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // --- CHECKOUT ACTIONS ---
  checkout() {
    if (this.cart.length === 0) return;
    const orderData = {
      items: this.cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: this.shippingAddress,
    };

    this.http
      .post<any>(`${this.baseUrl}/orders`, orderData, {
        headers: this.authService.getAuthHeaders(),
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage =
              'Order checkout completed successfully! Thank you for purchasing.';
            this.store.dispatch(CartActions.clearCart());
            this.shippingAddress = '';
            this.loadPurchaseHistory();
            this.loadProducts(); // Reload stocks
            this.activeTab = 'orders';
            this.clearMessages();
          }
        },
        error: (err) =>
          (this.errorMessage = err.error?.message || 'Failed to place order'),
      });
  }

  // --- PURCHASE HISTORY ACTIONS ---
  loadPurchaseHistory() {
    this.store.dispatch(OrdersActions.loadCustomerOrders());
  }

  // --- MESSAGING ACTIONS ---
  loadChats() {
    this.http
      .get<any>(`${this.baseUrl}/messages/conversations`, {
        headers: this.authService.getAuthHeaders(),
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.chats = res.data;
          }
        },
        error: (err) =>
          (this.errorMessage =
            err.error?.message || 'Failed to load conversations'),
      });
  }

  selectChat(chat: any) {
    this.selectedChat = chat;
    this.loadMessages(chat.otherUser._id);
  }

  loadMessages(otherUserId: string) {
    this.http
      .get<any>(`${this.baseUrl}/messages/conversation/${otherUserId}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.chatMessages = res.data;
            if (this.selectedChat) {
              this.selectedChat.lastMessage.isRead = true;
            }
          }
        },
        error: (err) =>
          (this.errorMessage = err.error?.message || 'Failed to load messages'),
      });
  }

  sendChatMessage() {
    if (!this.newMessageText.trim() || !this.selectedChat) return;

    const payload = {
      receiverId: this.selectedChat.otherUser._id,
      content: this.newMessageText,
    };

    this.http
      .post<any>(`${this.baseUrl}/messages`, payload, {
        headers: this.authService.getAuthHeaders(),
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.chatMessages.push(res.data);
            this.newMessageText = '';
            this.loadChats();
          }
        },
        error: (err) =>
          (this.errorMessage = err.error?.message || 'Failed to send message'),
      });
  }

  startChatWithSeller(sellerUserId: string, storeName: string) {
    if (!sellerUserId) {
      alert('Cannot chat with this seller (missing profile).');
      return;
    }
    if (sellerUserId === this.currentUserId) {
      alert('You cannot chat with yourself!');
      return;
    }
    this.activeTab = 'chat';

    const existingChat = this.chats.find(
      (c) => c.otherUser._id === sellerUserId,
    );
    if (existingChat) {
      this.selectChat(existingChat);
    } else {
      const tempChat = {
        otherUser: {
          _id: sellerUserId,
          email: 'Store Owner',
          role: 'store_owner',
          profile: { name: storeName || 'Store Owner' },
        },
        lastMessage: {
          content: 'No messages yet.',
          isRead: true,
          senderId: '',
          receiverId: sellerUserId,
          createdAt: new Date(),
        },
      };
      this.chats.unshift(tempChat);
      this.selectChat(tempChat);
    }
  }

  // --- ACCOUNT CRUD ACTIONS ---
  updateProfile() {
    this.http
      .put<any>(`${this.baseUrl}/auth/profile`, this.profileForm, {
        headers: this.authService.getAuthHeaders(),
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Profile updated successfully!';
            const user = this.authService.currentUserValue;
            user.profile = res.data.profile;
            localStorage.setItem('shopee_user', JSON.stringify(user));
            this.customerName = user.profile.name;
            this.clearMessages();
          }
        },
        error: (err) =>
          (this.errorMessage =
            err.error?.message || 'Failed to update profile'),
      });
  }

  deactivateAccount() {
    if (
      confirm(
        'WARNING: Are you sure you want to deactivate your account? This action is permanent and you will be logged out.',
      )
    ) {
      this.http
        .put<any>(
          `${this.baseUrl}/auth/deactivate`,
          {},
          { headers: this.authService.getAuthHeaders() },
        )
        .subscribe({
          next: (res) => {
            if (res.success) {
              alert('Your account has been deactivated. Logging you out.');
              this.logout();
            }
          },
          error: (err) =>
            (this.errorMessage =
              err.error?.message || 'Failed to deactivate account'),
        });
    }
  }

  // --- PURCHASING CRUD ACTIONS ---
  cancelOrder(orderId: string) {
    if (
      confirm(
        'Are you sure you want to cancel this order? This action is permanent and you will be logged out.',
      )
    ) {
      // Wait, cancel doesn't log them out! Just confirm cancel.
    }
    // Let's write the correct confirm check:
    if (
      confirm(
        'Are you sure you want to cancel this order? The items will be returned to inventory.',
      )
    ) {
      this.http
        .patch<any>(
          `${this.baseUrl}/orders/${orderId}/cancel`,
          {},
          { headers: this.authService.getAuthHeaders() },
        )
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.successMessage = 'Order cancelled successfully!';
              this.loadPurchaseHistory();
              this.loadProducts();
              this.clearMessages();
            }
          },
          error: (err) =>
            (this.errorMessage =
              err.error?.message || 'Failed to cancel order'),
        });
    }
  }

  startEditAddress(order: any) {
    this.editingOrderAddressId = order._id;
    this.newOrderAddressText = order.shippingAddress;
  }

  cancelEditAddress() {
    this.editingOrderAddressId = null;
    this.newOrderAddressText = '';
  }

  saveOrderAddress(orderId: string) {
    if (!this.newOrderAddressText.trim()) return;

    this.http
      .patch<any>(
        `${this.baseUrl}/orders/${orderId}/address`,
        { address: this.newOrderAddressText },
        { headers: this.authService.getAuthHeaders() },
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Shipping address updated successfully!';
            this.cancelEditAddress();
            this.loadPurchaseHistory();
            this.clearMessages();
          }
        },
        error: (err) =>
          (this.errorMessage =
            err.error?.message || 'Failed to update shipping address'),
      });
  }

  // --- WEBSOCKET ACTIONS ---
  initWebSocket() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = new WebSocket(
      `ws://localhost:3000?userId=${this.currentUserId}`,
    );

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new_message') {
          const message = payload.data;
          if (
            this.selectedChat &&
            (message.senderId._id === this.selectedChat.otherUser._id ||
              message.senderId === this.selectedChat.otherUser._id)
          ) {
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
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('assets/')
    ) {
      return trimmed;
    }
    if (
      trimmed.endsWith('.png') ||
      trimmed.endsWith('.jpg') ||
      trimmed.endsWith('.jpeg') ||
      trimmed.endsWith('.webp')
    ) {
      return 'assets/' + trimmed;
    }
    return 'assets/shopee_logo.png';
  }

  // --- ORDER TRACKING TIMELINE ---
  viewTracking(order: any) {
    this.trackingModalOrder = order;
  }

  closeTrackingModal() {
    this.trackingModalOrder = null;
  }

  // --- PRODUCT REVIEWS & RATINGS ---
  openReviewModal(productId: string, productName: string, orderId: string) {
    this.reviewProductName = productName;
    this.reviewForm = {
      productId,
      orderId,
      rating: 5,
      reviewText: ''
    };
    this.reviewModalOpen = true;
  }

  closeReviewModal() {
    this.reviewModalOpen = false;
  }

  submitReview() {
    if (!this.reviewForm.productId || !this.reviewForm.orderId || !this.reviewForm.reviewText.trim()) return;

    this.http.post<any>(`${this.baseUrl}/reviews`, this.reviewForm, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Review submitted successfully! Thank you for your feedback.';
          this.closeReviewModal();
          this.loadPurchaseHistory();
          this.clearMessages();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to submit review';
        this.clearMessages();
      }
    });
  }

  viewProductReviews(product: any) {
    this.selectedProductForReviews = product;
    this.selectedProductReviews = [];
    this.http.get<any>(`${this.baseUrl}/reviews/product/${product._id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedProductReviews = res.data;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load product reviews';
        this.clearMessages();
      }
    });
  }

  closeProductReviews() {
    this.selectedProductForReviews = null;
  }

  getStarRatingArray(rating: number): any[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  trackByProductId(index: number, item: any): string {
    return item.productId || item._id || index.toString();
  }
}
