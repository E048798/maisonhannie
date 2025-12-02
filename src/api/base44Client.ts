type User = { id: string; email: string; full_name?: string };
type OrderItem = { id: number; name: string; image: string; price: number; quantity: number };
type Order = {
  id: string;
  tracking_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  total: number;
  created_date: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  status: string;
  status_history?: { status: string; timestamp: string; note?: string }[];
  items: OrderItem[];
  promo_sent?: boolean;
};

let _authenticated = false;
let _user: User | null = { id: "u_1", email: "admin@maisonhannie.com", full_name: "Admin" };

let _orders: Order[] = [
  {
    id: "ord_1",
    tracking_code: "MH-2025-0001",
    customer_name: "Tomiwa A.",
    phone: "+2348012345678",
    email: "tomiwa@example.com",
    total: 58000,
    created_date: new Date(Date.now() - 86400000).toISOString(),
    address: "12 Artisan Way",
    city: "Lagos",
    state: "LA",
    status: "pending",
    items: [
      { id: 101, name: "Aurora Coaster Set", image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=200&h=200&fit=crop", price: 28000, quantity: 1 },
      { id: 102, name: "Pearl Elegance Necklace", image: "https://images.unsplash.com/photo-1519741491161-3f5b8af0f43a?w=200&h=200&fit=crop", price: 30000, quantity: 1 },
    ],
  },
  {
    id: "ord_2",
    tracking_code: "MH-2025-0002",
    customer_name: "Kemi O.",
    phone: "+2348098765432",
    email: "kemi@example.com",
    total: 32000,
    created_date: new Date().toISOString(),
    address: "44 Market Street",
    city: "Abuja",
    state: "FC",
    status: "confirmed",
    items: [{ id: 201, name: "Sunset Wave Tray", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop", price: 32000, quantity: 1 }],
  },
  {
    id: "ord_3",
    tracking_code: "MH-2025-0003",
    customer_name: "Bisi O.",
    phone: "+2348022222222",
    email: "bisi@example.com",
    total: 150000,
    created_date: new Date(Date.now() - 172800000).toISOString(),
    address: "9 Palm Grove",
    city: "Ibadan",
    state: "OY",
    status: "processing",
    items: [{ id: 301, name: "Grand Event Buffet", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop", price: 150000, quantity: 1 }],
  },
];

export const base44 = {
  auth: {
    async isAuthenticated() {
      return _authenticated;
    },
    async me() {
      return _user as User;
    },
    redirectToLogin(returnTo: string) {
      _authenticated = true;
    },
    logout() {
      _authenticated = false;
    },
  },
  entities: {
    Order: {
      async list(orderBy: string) {
        const arr = [..._orders];
        if (orderBy === "-created_date") arr.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        return arr;
      },
      async filter(filter: { tracking_code?: string }) {
        const code = filter.tracking_code?.toUpperCase();
        return _orders.filter((o) => (code ? o.tracking_code.toUpperCase() === code : true));
      },
      async create(data: Omit<Order, "id" | "created_date">) {
        const newOrder: Order = {
          id: `ord_${Date.now()}`,
          created_date: new Date().toISOString(),
          ...data,
        };
        _orders = [newOrder, ..._orders];
        return newOrder;
      },
      async update(id: string, data: Partial<Order>) {
        const idx = _orders.findIndex((o) => o.id === id);
        if (idx >= 0) {
          const next = { ..._orders[idx], ...data };
          _orders[idx] = next;
          return next;
        }
        throw new Error("Order not found");
      },
    },
  },
};