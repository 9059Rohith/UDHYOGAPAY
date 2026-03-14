import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import promotionService from '../../services/promotionService';
import type { CreatePromotionPayload, Promotion } from '../../types/promotion.types';

const defaultForm: CreatePromotionPayload = {
  code: '',
  usageLimit: 1,
  validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  discountType: 'flat',
  discountValue: 0,
  isActive: true
};

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<CreatePromotionPayload>(defaultForm);

  const sortedPromotions = useMemo(
    () => [...promotions].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [promotions]
  );

  const loadPromotions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await promotionService.getAll();
      setPromotions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: CreatePromotionPayload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        usageLimit: Number(form.usageLimit),
        discountValue: Number(form.discountValue),
        validUntil: new Date(form.validUntil).toISOString()
      };

      if (!payload.code) {
        throw new Error('Promotion code is required');
      }

      if (payload.discountType === 'percentage' && payload.discountValue > 100) {
        throw new Error('Percentage discount cannot exceed 100');
      }

      await promotionService.create(payload);
      setForm(defaultForm);
      await loadPromotions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promotion: Promotion) => {
    setError('');
    try {
      const updated = await promotionService.toggleActive(promotion);
      setPromotions(
        promotions.map((item: Promotion) => (item._id === updated._id ? updated : item))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle promotion');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Promotions Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create and manage promotion codes with usage limits, validity windows, and discount rules.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1"
          >
            <h2 className="text-lg font-semibold text-slate-900">Create Promotion</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="promotion-code" className="mb-1 block text-sm font-medium text-slate-700">
                  Code
                </label>
                <input
                  id="promotion-code"
                  value={form.code}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, code: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="SAVE50"
                  required
                />
              </div>

              <div>
                <label htmlFor="promotion-usage-limit" className="mb-1 block text-sm font-medium text-slate-700">
                  Usage Limit
                </label>
                <input
                  id="promotion-usage-limit"
                  type="number"
                  min={1}
                  value={form.usageLimit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, usageLimit: Number(e.target.value) })
                  }
                  placeholder="100"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="promotion-valid-until" className="mb-1 block text-sm font-medium text-slate-700">
                  Valid Until
                </label>
                <input
                  id="promotion-valid-until"
                  type="datetime-local"
                  value={form.validUntil}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, validUntil: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="promotion-discount-type" className="mb-1 block text-sm font-medium text-slate-700">
                    Discount Type
                  </label>
                  <select
                    id="promotion-discount-type"
                    value={form.discountType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setForm({
                        ...form,
                        discountType: e.target.value as 'flat' | 'percentage'
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="flat">Flat</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="promotion-discount-value" className="mb-1 block text-sm font-medium text-slate-700">
                    Value
                  </label>
                  <input
                    id="promotion-discount-value"
                    type="number"
                    min={0}
                    value={form.discountValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, discountValue: Number(e.target.value) })
                    }
                    placeholder="10"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>
              </div>

              <label htmlFor="promotion-is-active" className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  id="promotion-is-active"
                  type="checkbox"
                  checked={Boolean(form.isActive)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Active on creation
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Create Promotion'}
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Promotion Codes</h2>
              <button
                onClick={loadPromotions}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                type="button"
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
              <p className="text-sm text-slate-500">Loading promotions...</p>
            ) : sortedPromotions.length === 0 ? (
              <p className="text-sm text-slate-500">No promotions created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-600">
                      <th className="py-2 pr-3">Code</th>
                      <th className="py-2 pr-3">Usage</th>
                      <th className="py-2 pr-3">Valid Until</th>
                      <th className="py-2 pr-3">Discount</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPromotions.map((promotion) => (
                      <tr key={promotion._id} className="border-b border-slate-100">
                        <td className="py-3 pr-3 font-semibold text-slate-900">{promotion.code}</td>
                        <td className="py-3 pr-3 text-slate-700">
                          {promotion.usedCount}/{promotion.usageLimit}
                        </td>
                        <td className="py-3 pr-3 text-slate-700">
                          {new Date(promotion.validUntil).toLocaleString()}
                        </td>
                        <td className="py-3 pr-3 text-slate-700">
                          {promotion.discountType === 'flat'
                            ? `Rs ${promotion.discountValue}`
                            : `${promotion.discountValue}%`}
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              promotion.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {promotion.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleToggle(promotion)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            {promotion.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsManagement;
