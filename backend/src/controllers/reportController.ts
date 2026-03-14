import { Request, Response } from 'express';
import Booking from '../models/Booking';
import BookingCancellation from '../models/BookingCancellation';

interface PaymentOverviewAggregation {
  _id: null;
  completedBookings: number;
  totalRevenue: number;
}

interface PaymentMethodAggregation {
  _id: string;
  bookingCount: number;
  revenue: number;
}

interface CancellationReasonAggregation {
  _id: string;
  count: number;
  totalRefund: number;
}

interface FunnelAggregation {
  _id: string;
  total: number;
  completed: number;
  cancelled: number;
}

interface PeakHourAggregation {
  _id: number;
  totalBookings: number;
}

export const getPaymentSummary = async (_req: Request, res: Response) => {
  try {
    const [overview, methodBreakdown] = await Promise.all([
      Booking.aggregate<PaymentOverviewAggregation>([
        { $match: { status: 'completed', paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            completedBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing' }
          }
        }
      ]),
      Booking.aggregate<PaymentMethodAggregation>([
        { $match: { status: 'completed', paymentStatus: 'paid' } },
        {
          $group: {
            _id: '$paymentMethod',
            bookingCount: { $sum: 1 },
            revenue: { $sum: '$pricing' }
          }
        },
        { $sort: { revenue: -1 } }
      ])
    ]);

    const completedBookings = overview[0]?.completedBookings ?? 0;
    const totalRevenue = overview[0]?.totalRevenue ?? 0;

    const csvRows: string[] = [
      'section,metric,value',
      `summary,completed_bookings,${completedBookings}`,
      `summary,total_revenue,${totalRevenue.toFixed(2)}`,
      '',
      'section,payment_method,booking_count,revenue'
    ];

    methodBreakdown.forEach((row: PaymentMethodAggregation) => {
      csvRows.push(
        `payment_breakdown,${row._id || 'unknown'},${row.bookingCount},${row.revenue.toFixed(2)}`
      );
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payment-summary.csv"');

    return res.status(200).send(csvContent);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate payment summary';
    return res.status(500).json({ success: false, message });
  }
};

export const getCancellationReport = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const dailyWindowStart = new Date(now);
    dailyWindowStart.setDate(now.getDate() - 30);

    const monthlyWindowStart = new Date(now);
    monthlyWindowStart.setMonth(now.getMonth() - 12);

    const [reasonSummary, dailyFunnel, monthlyFunnel, peakHours] = await Promise.all([
      BookingCancellation.aggregate<CancellationReasonAggregation>([
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 },
            totalRefund: { $sum: '$refundAmount' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Booking.aggregate<FunnelAggregation>([
        { $match: { createdAt: { $gte: dailyWindowStart } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            cancelled: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate<FunnelAggregation>([
        { $match: { createdAt: { $gte: monthlyWindowStart } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',
                date: '$createdAt'
              }
            },
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            cancelled: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate<PeakHourAggregation>([
        {
          $group: {
            _id: { $hour: '$createdAt' },
            totalBookings: { $sum: 1 }
          }
        },
        { $sort: { totalBookings: -1 } },
        { $limit: 5 }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reasonSummary: reasonSummary.map((row: CancellationReasonAggregation) => ({
          reason: row._id,
          cancellationCount: row.count,
          totalRefundAmount: row.totalRefund
        })),
        dailyFunnel: dailyFunnel.map((row: FunnelAggregation) => ({
          date: row._id,
          totalBookings: row.total,
          completedBookings: row.completed,
          cancelledBookings: row.cancelled,
          cancellationRate: row.total > 0 ? Number(((row.cancelled / row.total) * 100).toFixed(2)) : 0
        })),
        monthlyFunnel: monthlyFunnel.map((row: FunnelAggregation) => ({
          month: row._id,
          totalBookings: row.total,
          completedBookings: row.completed,
          cancelledBookings: row.cancelled,
          cancellationRate: row.total > 0 ? Number(((row.cancelled / row.total) * 100).toFixed(2)) : 0
        })),
        peakHours: peakHours.map((row: PeakHourAggregation) => ({
          hourOfDay: row._id,
          totalBookings: row.totalBookings
        }))
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate cancellation report';
    return res.status(500).json({ success: false, message });
  }
};
