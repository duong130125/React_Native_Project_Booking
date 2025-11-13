// Payment Card Types
export interface PaymentCardRequest {
  cardHolderName: string;
  cardBrand: string; // VISA, MASTERCARD, etc.
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvv: string; // Không lưu vào DB, chỉ validate
  isDefault?: boolean;
}

export interface PaymentCardResponse {
  id: number;
  userId: number;
  cardHolderName: string;
  cardBrand: string;
  cardNumber: string; // Masked: **** **** **** 1234
  expMonth: number;
  expYear: number;
  balance: string; // Số dư
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Payment Types
export interface PaymentRequest {
  bookingId: number;
  paymentMethod: "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "EWALLET";
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string; // Format: "MM/YY" or "MM/YYYY"
  cvv: string;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export interface PaymentResponse {
  id: number;
  userId: number;
  bookingId: number;
  bookingCode?: string;
  cardId: number;
  cardNumber: string; // Masked
  cardBrand: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
}
