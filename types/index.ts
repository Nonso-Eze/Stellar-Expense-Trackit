// Shared TypeScript types across the app

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  stellarAddress?: string | null;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  createdAt: string;
  owner: UserProfile;
  members: GroupMember[];
  expenses: Expense[];
}

export interface GroupMember {
  id: string;
  userId: string;
  user: UserProfile;
  joinedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  splitType: string;
  createdAt: string;
  payerId: string;
  payer: UserProfile;
  shares: ExpenseShare[];
}

export interface ExpenseShare {
  id: string;
  amount: number;
  paid: boolean;
  userId: string;
  user: UserProfile;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  stellarTxHash?: string | null;
  memo?: string | null;
  createdAt: string;
  completedAt?: string | null;
  senderId: string;
  receiverId: string;
  sender: UserProfile;
  receiver: UserProfile;
}

export interface GroupBalance {
  userId: string;
  displayName: string;
  net: number;
}

export interface Settlement {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}
