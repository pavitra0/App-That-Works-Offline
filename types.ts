
export enum ReportCategory {
  EMERGENCY = 'Emergency',
  FOOD = 'Food',
  MEDICAL = 'Medical',
  SHELTER = 'Shelter'
}

export interface Report {
  id?: number;
  serverId?: string; // ID assigned by the backend
  name: string;
  location: string;
  category: ReportCategory;
  description: string;
  timestamp: number;
  status: 'pending' | 'synced';
  hasImage: boolean; // For smart sync prioritization
  error?: string;
}

export interface NetworkStatus {
  isOnline: boolean;
}
