import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './error';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface ProductChoice {
  name: string;
  image?: string;
}

export interface ProductOption {
  name: string;
  choices: (string | ProductChoice)[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: string; 
  options?: ProductOption[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'bekliyor' | 'onaylandı' | 'tamamlandı';
  note?: string;
  createdAt: string | any;
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'categories');
  }
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), category);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'categories');
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
  }
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  try {
    await updateDoc(doc(db, 'categories', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'products');
  }
};

export const getProductConfig = async (id: string): Promise<Product | null> => {
  try {
    const d = await getDoc(doc(db, 'products', id));
    return d.exists() ? ({ id: d.id, ...d.data() } as Product) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `products/${id}`);
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), product);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'products');
  }
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  try {
    await updateDoc(doc(db, 'products', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
  }
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'orders');
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'orders');
  }
};

export const addOrder = async (order: Omit<Order, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), order);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'orders');
  }
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  try {
    await updateDoc(doc(db, 'orders', id), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
  }
};
