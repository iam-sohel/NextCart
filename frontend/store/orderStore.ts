import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItem {
  id: number | string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: OrderAddress;
  paymentMethod: "COD" | "ONLINE";
  orderDate: number;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.orderId === orderId);
      },
    }),
    {
      name: "nextcart-orders",
    }
  )
);

export default useOrderStore;