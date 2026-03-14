import { useEffect, useMemo, useState } from 'react';
import reportService from '../../services/reportService';
import type {
  CancellationReasonSummary,
  DailyFunnelPoint,
  MonthlyFunnelPoint,
  PeakHourPoint
} from '../../types/report.types';

const ReportsDashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [reasonSummary, setReasonSummary] = useState<CancellationReasonSummary[]>([]);
  const [dailyFunnel, setDailyFunnel] = useState<DailyFunnelPoint[]>([]);
  const [monthlyFunnel, setMonthlyFunnel] = useState<MonthlyFunnelPoint[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourPoint[]>([]);

  const totals = useMemo(() => {
    return reasonSummary.reduce(
      (acc, row) => {
        acc.cancellations += row.cancellationCount;
        acc.refunds += row.totalRefundAmount;
        return acc;
      },
      { cancellations: 0, refunds: 0 }
    );
  }, [reasonSummary]);

  const fetchCancellationReport = async () => {
    setLoading(true);
    setError('');
    try {
      const report = await reportService.getCancellationReport();
      setReasonSummary(report.reasonSummary);
      setDailyFunnel(report.dailyFunnel);
      setMonthlyFunnel(report.monthlyFunnel);
      setPeakHours(report.peakHours);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cancellation report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancellationReport();
  }, []);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    setError('');
    try {
      await reportService.triggerPaymentSummaryDownload('payment-transaction-summary.csv');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download payment summary CSV');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-stone-900">Reports Dashboard</h1>
          <p className="mt-2 text-sm text-stone-600">
            Download payment summaries and monitor booking volume with cancellation trends.
          </p>
          <div className="mt-4">
            <button
              onClick={handleDownloadCsv}
              disabled={downloading}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              {downloading
                ? 'Preparing CSV...'
                : 'Download Payment & Transaction Summary Report (CSV)'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Total Cancellations</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{totals.cancellations}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Total Refund Amount</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">Rs {totals.refunds.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Daily Points</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{dailyFunnel.length}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Monthly Points</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{monthlyFunnel.length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Booking Volume & Cancellation Rate</h2>
              <button
                onClick={fetchCancellationReport}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                type="button"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-stone-500">Loading report data...</p>
            ) : reasonSummary.length === 0 ? (
              <p className="text-sm text-stone-500">No cancellation records available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-stone-600">
                      <th className="py-2 pr-3">Reason</th>
                      <th className="py-2 pr-3">Cancellation Count</th>
                      <th className="py-2">Total Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reasonSummary.map((row) => (
                      <tr key={row.reason} className="border-b border-stone-100">
                        <td className="py-3 pr-3 font-medium text-stone-900">{row.reason}</td>
                        <td className="py-3 pr-3 text-stone-700">{row.cancellationCount}</td>
                        <td className="py-3 text-stone-700">Rs {row.totalRefundAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-stone-900">Peak Booking Hours</h3>
              {peakHours.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">No peak hour data.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-stone-700">
                  {peakHours.map((point) => (
                    <li
                      key={point.hourOfDay}
                      className="flex items-center justify-between rounded-md bg-stone-100 px-3 py-2"
                    >
                      <span>{point.hourOfDay}:00 - {point.hourOfDay + 1}:00</span>
                      <strong>{point.totalBookings}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-stone-900">Latest Daily Funnel Snapshot</h3>
              {dailyFunnel.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">No daily funnel data.</p>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-stone-700">
                  {dailyFunnel.slice(-5).map((point) => (
                    <div key={point.date} className="rounded-md bg-stone-100 p-3">
                      <p className="font-semibold text-stone-900">{point.date}</p>
                      <p>Total: {point.totalBookings}</p>
                      <p>Cancelled: {point.cancelledBookings}</p>
                      <p>Rate: {point.cancellationRate}%</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
