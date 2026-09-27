export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  category: string;
  transactionId: string | null;
  amount: number | null;
  budgetLimit: number;
  currentSpent: number;
  excessAmount: number | null;
  percentage: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedNotifications {
  items: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OverspendCheckResult {
  alertGenerated: boolean;
  reason?: string;
  notification?: Notification;
  metrics?: {
    category: string;
    budgetLimit: number;
    currentSpent: number;
    percentage: number;
    thresholdPercentage: number;
    excessAmount: number;
  };
}
