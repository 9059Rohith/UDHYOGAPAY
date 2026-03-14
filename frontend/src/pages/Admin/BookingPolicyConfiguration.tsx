import { FormEvent, useEffect, useState } from 'react';
import policyService from '../../services/policyService';
import type { BookingPolicy, CreateBookingPolicyPayload } from '../../types/policy.types';

const initialForm: CreateBookingPolicyPayload = {
  name: '',
  cancellationWindowHours: 0,
  refundEligibilityPercentage: 0,
  description: '',
  isActive: true
};

const BookingPolicyConfiguration = () => {
  const [policies, setPolicies] = useState<BookingPolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<CreateBookingPolicyPayload>(initialForm);

  const fetchPolicies = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await policyService.getAll();
      setPolicies(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: CreateBookingPolicyPayload = {
        ...form,
        name: form.name.trim(),
        cancellationWindowHours: Number(form.cancellationWindowHours),
        refundEligibilityPercentage: Number(form.refundEligibilityPercentage)
      };

      if (!payload.name) {
        throw new Error('Policy name is required');
      }

      if (payload.refundEligibilityPercentage < 0 || payload.refundEligibilityPercentage > 100) {
        throw new Error('Refund eligibility percentage must be between 0 and 100');
      }

      await policyService.create(payload);
      setForm(initialForm);
      await fetchPolicies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create booking policy');
    } finally {
      setSaving(false);
    }
  };

  const togglePolicyStatus = async (policy: BookingPolicy) => {
    setError('');
    try {
      const updated = await policyService.update(policy._id, { isActive: !policy.isActive });
      setPolicies((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update policy status');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Booking Policy Configuration</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Manage cancellation window rules and refund eligibility percentages used at runtime.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-1"
          >
            <h2 className="text-lg font-semibold text-zinc-900">Add Policy</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Policy Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                  placeholder="Standard Cancellation"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Cancellation Window (Hours)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.cancellationWindowHours}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, cancellationWindowHours: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Refund Eligibility (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.refundEligibilityPercentage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      refundEligibilityPercentage: Number(e.target.value)
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                  placeholder="Applicable terms and operational notes"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={Boolean(form.isActive)}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                Active policy
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Create Policy'}
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Runtime Policies</h2>
              <button
                type="button"
                onClick={fetchPolicies}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Refresh
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-sm text-zinc-500">Loading policies...</p>
            ) : policies.length === 0 ? (
              <p className="text-sm text-zinc-500">No booking policies configured yet.</p>
            ) : (
              <div className="space-y-3">
                {policies.map((policy) => (
                  <div
                    key={policy._id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">{policy.name}</h3>
                        <p className="mt-1 text-xs text-zinc-600">{policy.description || 'No description'}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-md bg-white px-2 py-1 text-zinc-700">
                            Window: {policy.cancellationWindowHours}h
                          </span>
                          <span className="rounded-md bg-white px-2 py-1 text-zinc-700">
                            Refund: {policy.refundEligibilityPercentage}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            policy.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePolicyStatus(policy)}
                          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                        >
                          {policy.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPolicyConfiguration;
