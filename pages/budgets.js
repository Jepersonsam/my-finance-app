import { useState, useEffect } from 'react';
import { budgetAPI, transactionAPI } from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { formatCurrency, calculatePercentage, formatPercentage, formatNumberInput, parseNumberInput } from '@/utils/format';
import { useNotification } from '@/contexts/NotificationContext';

const CATEGORIES = [
  { value: 'Makanan', label: 'Makanan' },
  { value: 'Transportasi', label: 'Transportasi' },
  { value: 'Hiburan', label: 'Hiburan' },
  { value: 'Kesehatan', label: 'Kesehatan' },
  { value: 'Belanja', label: 'Belanja' },
  { value: 'Tagihan', label: 'Tagihan' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' },
];

export default function Budgets() {
  const { notify } = useNotification();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBudgets();
    loadTransactions();
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await budgetAPI.getAll();
      const formattedData = Array.isArray(data)
        ? data.map((b) => ({
          ...b,
          startDate: b.start_date,
        }))
        : [];
      setBudgets(formattedData);
    } catch (error) {
      console.error('Error loading budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // Load transactions untuk menghitung pengeluaran per kategori
      const data = await transactionAPI.getAll();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      const formatted = formatNumberInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Kategori wajib diisi';
    const amountValue = parseNumberInput(formData.amount);
    if (!formData.amount || amountValue <= 0)
      newErrors.amount = 'Jumlah anggaran wajib diisi dan harus lebih dari 0';
    if (!formData.startDate) newErrors.startDate = 'Tanggal mulai wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const budget = {
        ...formData,
        amount: parseNumberInput(formData.amount),
      };

      if (editingId) {
        await budgetAPI.update(editingId, budget);
        notify.success('Anggaran berhasil diperbarui');
      } else {
        await budgetAPI.create(budget);
        notify.success('Anggaran berhasil disimpan');
      }

      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      setEditingId(null);
      loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      notify.error('Gagal menyimpan anggaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category,
      amount: formatNumberInput(budget.amount.toString()),
      period: budget.period,
      startDate: budget.startDate.split('T')[0],
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) {
      try {
        await budgetAPI.delete(id);
        notify.success('Anggaran berhasil dihapus');
        loadBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
        notify.error('Gagal menghapus anggaran');
      }
    }
  };

  const getBudgetStatus = (budget) => {
    const percentage = calculatePercentage(budget.spent || 0, budget.amount);
    if (percentage >= 100) return { status: 'exceeded', color: 'red' };
    if (percentage >= 80) return { status: 'warning', color: 'yellow' };
    return { status: 'good', color: 'green' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Anggaran Keuangan</h1>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              category: '',
              amount: '',
              period: 'monthly',
              startDate: new Date().toISOString().split('T')[0],
            });
          }}
        >
          {showForm ? 'Batal' : '+ Tambah Anggaran'}
        </Button>
      </div>

      {showForm && (
        <Card title={editingId ? 'Edit Anggaran' : 'Tambah Anggaran Baru'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Kategori"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={CATEGORIES}
                error={errors.category}
                required
              />

              <Select
                label="Periode"
                name="period"
                value={formData.period}
                onChange={handleChange}
                options={PERIOD_OPTIONS}
                error={errors.period}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Jumlah Anggaran"
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                error={errors.amount}
                required
              />

              <Input
                label="Tanggal Mulai"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {editingId ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Daftar Anggaran">
        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const amount = parseFloat(budget.amount) || 0;
              const spent = budget.spent || 0;
              const percentage = calculatePercentage(spent, amount);
              const status = getBudgetStatus({ ...budget, amount });
              const remaining = amount - spent;

              return (
                <div
                  key={budget.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {budget.category}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Periode: {budget.period === 'monthly' ? 'Bulanan' : 'Tahunan'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-primary-600 hover:text-primary-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Terpakai</span>
                      <span className="font-medium">
                        {formatCurrency(spent)} / {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${status.status === 'exceeded'
                          ? 'bg-red-500'
                          : status.status === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          }`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Sisa: {formatCurrency(Math.max(remaining, 0))}
                    </span>
                    <span
                      className={`font-semibold ${status.status === 'exceeded'
                        ? 'text-red-600'
                        : status.status === 'warning'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                        }`}
                    >
                      {formatPercentage(percentage)}
                    </span>
                  </div>

                  {status.status === 'exceeded' && (
                    <div className="mt-2 text-sm text-red-600 font-medium">
                      ⚠️ Anggaran telah melebihi batas!
                    </div>
                  )}
                  {status.status === 'warning' && (
                    <div className="mt-2 text-sm text-yellow-600 font-medium">
                      ⚠️ Anggaran hampir habis!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada anggaran. Tambahkan anggaran pertama Anda.
          </div>
        )}
      </Card>
    </div>
  );
}
