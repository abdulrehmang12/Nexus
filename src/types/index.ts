export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  location?: string;
  preferences?: string[];
  twoFactorEnabled?: boolean;
  isOnline?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName?: string;
  pitchSummary?: string;
  fundingNeeded?: string;
  industry?: string;
  foundedYear?: number | null;
  teamSize?: number | null;
  startupHistory?: string[];
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests?: string[];
  investmentStage?: string[];
  portfolioCompanies?: string[];
  totalInvestments?: number;
  minimumInvestment?: string;
  maximumInvestment?: string;
  investmentHistory?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Document {
  _id: string;
  title: string;
  version: number;
  status: 'pending' | 'signed' | 'rejected';
  url: string;
  signatureImageUrl?: string | null;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  _id: string;
  title: string;
  host: User;
  guest: User;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
  durationMinutes: number;
  notes?: string;
  roomLink: string;
  calendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  provider: 'stripe' | 'paypal';
  paymentMethod: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  providerSessionId: string;
  note?: string;
  counterpartyUserId?: User | null;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestTwoFactorOtp: () => Promise<string>;
  verifyTwoFactorOtp: (otpCode: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
