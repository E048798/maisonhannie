export type OrderItem = { id: number; name: string; image: string; price: number; quantity: number };

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export type StatusHistoryEntry = { status: OrderStatus; timestamp: string; note?: string };

export type Order = {
  tracking_code: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  status_history?: StatusHistoryEntry[];
};

export function generateTrackingCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 15; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export function validateOrderPayload(order: Partial<Order>) {
  const required = [
    "tracking_code",
    "customer_name",
    "phone",
    "address",
    "city",
    "state",
    "items",
    "total",
    "status",
  ] as const;

  const errors: string[] = [];
  required.forEach((key) => {
    if ((order as any)[key] === undefined || (order as any)[key] === null || (typeof (order as any)[key] === "string" && !(order as any)[key].trim())) {
      errors.push(`Missing ${key}`);
    }
  });

  if (order.tracking_code && order.tracking_code.length !== 15) {
    errors.push("Invalid tracking_code length");
  }

  if (order.items && !Array.isArray(order.items)) {
    errors.push("Items must be an array");
  }

  if (order.status && !["pending","confirmed","processing","shipped","out_for_delivery","delivered"].includes(order.status)) {
    errors.push("Invalid status");
  }

  return { valid: errors.length === 0, errors };
}