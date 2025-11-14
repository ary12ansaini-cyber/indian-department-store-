export interface Product {
  id: number;
  name: string;
  price: number; // in INR
  category: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface BillItem extends Product {
  quantity: number;
}

export interface User {
  name: string;
  avatarUrl?: string;
  isGeneratingAvatar?: boolean;
}

export interface SavedBill {
  id: number; // Using timestamp as ID
  date: string;
  items: BillItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
}