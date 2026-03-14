export interface CancellationReasonSummary {
  reason: string;
  cancellationCount: number;
  totalRefundAmount: number;
}

export interface DailyFunnelPoint {
  date: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
}

export interface MonthlyFunnelPoint {
  month: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
}

export interface PeakHourPoint {
  hourOfDay: number;
  totalBookings: number;
}

export interface CancellationReport {
  reasonSummary: CancellationReasonSummary[];
  dailyFunnel: DailyFunnelPoint[];
  monthlyFunnel: MonthlyFunnelPoint[];
  peakHours: PeakHourPoint[];
}
