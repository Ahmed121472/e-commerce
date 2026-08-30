import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order } from '../types';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

// Clean object for Firestore (strip undefined values)
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Subscribe to real-time product updates from Firestore
 */
export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const productsCol = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    productsCol,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Product);
      });
      // Sort newest first by default
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore products listener error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe to real-time orders updates from Firestore
 */
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ordersCol = collection(db, ORDERS_COLLECTION);
  return onSnapshot(
    ordersCol,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Order);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore orders listener error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Upsert product into Firestore
 */
export async function syncProductToFirestore(product: Product): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(productRef, sanitizeForFirestore(product), { merge: true });
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
}

/**
 * Delete product from Firestore
 */
export async function removeProductFromFirestore(productId: string): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
}

/**
 * Create or save new order to Firestore
 */
export async function syncOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(orderRef, sanitizeForFirestore(order), { merge: true });
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    throw error;
  }
}

/**
 * Update order in Firestore
 */
export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, sanitizeForFirestore({
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error updating order in Firestore:', error);
    throw error;
  }
}

/**
 * Wipe all products and orders from Firestore to ensure clean live state
 */
export async function clearAllStoreData(): Promise<void> {
  try {
    // Delete all products
    const pSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (!pSnap.empty) {
      const batch1 = writeBatch(db);
      pSnap.forEach((docSnap) => batch1.delete(docSnap.ref));
      await batch1.commit();
    }

    // Delete all orders
    const oSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    if (!oSnap.empty) {
      const batch2 = writeBatch(db);
      oSnap.forEach((docSnap) => batch2.delete(docSnap.ref));
      await batch2.commit();
    }
  } catch (error) {
    console.error('Error clearing store data from Firestore:', error);
    throw error;
  }
}
