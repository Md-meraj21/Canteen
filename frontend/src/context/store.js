import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const calculateTotalPrice = (items) => {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('cart', JSON.stringify(items));
  } catch {
    console.error('Failed to save cart to localStorage');
  }
};

const initialCartItems = loadCartFromStorage();

export const useCartStore = create((set, get) => ({
  items: initialCartItems,
  totalPrice: calculateTotalPrice(initialCartItems),

  addItem: (product, quantity) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.product._id === product._id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      const totalPrice = state.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      const newItems = [...state.items];
      saveCartToStorage(newItems);
      return { items: newItems, totalPrice };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const items = state.items.filter((item) => item.product._id !== productId);
      const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      saveCartToStorage(items);
      return { items, totalPrice };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const item = state.items.find((item) => item.product._id === productId);
      if (item) {
        item.quantity = quantity;
      }
      const totalPrice = state.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      saveCartToStorage(state.items);
      return { items: [...state.items], totalPrice };
    });
  },

  clearCart: () => {
    saveCartToStorage([]);
    set({ items: [], totalPrice: 0 });
  },
}));

const loadWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveWishlistToStorage = (items) => {
  try {
    localStorage.setItem('wishlist', JSON.stringify(items));
  } catch {
    console.error('Failed to save wishlist to localStorage');
  }
};

export const useWishlistStore = create((set, get) => ({
  items: loadWishlistFromStorage(),

  isWishlisted: (productId) => get().items.some((product) => product._id === productId),

  toggleItem: (product) => {
    set((state) => {
      const exists = state.items.some((item) => item._id === product._id);
      const items = exists
        ? state.items.filter((item) => item._id !== product._id)
        : [product, ...state.items];
      saveWishlistToStorage(items);
      return { items };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const items = state.items.filter((item) => item._id !== productId);
      saveWishlistToStorage(items);
      return { items };
    });
  },
}));
