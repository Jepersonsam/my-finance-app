import { useState, useEffect } from 'react';
import { transactionAPI } from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { formatCurrency, formatDateShort, formatNumberInput, parseNumberInput } from '@/utils/format';
import { exportToExcel, exportToPDF } from '@/utils/export';
import { useNotification } from '@/contexts/NotificationContext';

const TRANSACTION_CATEGORIES = [
  { value: 'Makanan', label: 'Makanan' },
  { value: 'Transportasi', label: 'Transportasi' },
  { value: 'Hiburan', label: 'Hiburan' },
  { value: 'Kesehatan', label: 'Kesehatan' },
  { value: 'Belanja', label: 'Belanja' },
  { value: 'Tagihan', label: 'Tagihan' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const INCOME_CATEGORIES = [
  { value: 'Gaji', label: 'Gaji' },
  { value: 'Bonus', label: 'Bonus' },
  { value: 'Investasi', label: 'Investasi' },
  { value: 'Lainnya', label: 'Lainnya' },
];

export default function Transactions() {
  const { notify } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      const data = await transactionAPI.getByDateRange(startDate, endDate);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format input jumlah dengan titik sebagai pemisah ribuan
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
      newErrors.amount = 'Jumlah wajib diisi dan harus lebih dari 0';
    if (!formData.date) newErrors.date = 'Tanggal wajib diisi';
    if (!formData.description) newErrors.description = 'Keterangan wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const transaction = {
        ...formData,
        amount: parseNumberInput(formData.amount),
      };

      if (editingId) {
        // Update transaction
        await transactionAPI.update(editingId, transaction);
        notify.success('Transaksi berhasil diperbarui');
      } else {
        // Create new transaction
        await transactionAPI.create(transaction);
        notify.success('Transaksi berhasil disimpan');
      }

      // Reset form
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setShowForm(false);
      setEditingId(null);
      loadTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      notify.error('Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: formatNumberInput(transaction.amount.toString()),
      date: transaction.date.split('T')[0],
      description: transaction.description,
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await transactionAPI.delete(id);
        notify.success('Transaksi berhasil dihapus');
        loadTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        notify.error('Gagal menghapus transaksi');
      }
    }
  };

  const categories =
    formData.type === 'income' ? INCOME_CATEGORIES : TRANSACTION_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              type: 'expense',
              category: '',
              amount: '',
              date: new Date().toISOString().split('T')[0],
              description: '',
            });
          }}
        >
          {showForm ? 'Batal' : '+ Tambah Transaksi'}
        </Button>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-gray-700 font-medium">Periode:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => exportToExcel(transactions, `Transaksi_${selectedMonth}`)}
            disabled={transactions.length === 0}
          >
            Export Excel
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportToPDF(transactions, `Transaksi_${selectedMonth}`, `Laporan Transaksi - ${selectedMonth}`)}
            disabled={transactions.length === 0}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {
        showForm && (
          <Card title={editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Transaksi
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Pengeluaran
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Pemasukan
                    </label>
                  </div>
                </div>

                <Select
                  label="Kategori"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={categories}
                  error={errors.category}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Jumlah"
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0"
                  error={errors.amount}
                  required
                />

                <Input
                  label="Tanggal"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  error={errors.date}
                  required
                />
              </div>

              <Input
                label="Keterangan"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi transaksi"
                error={errors.description}
                required
              />

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
        )
      }

      <Card title="Daftar Transaksi">
        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateShort(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {transaction.type === 'income'
                          ? 'Pemasukan'
                          : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.description}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada transaksi. Tambahkan transaksi pertama Anda.
          </div>
        )}
      </Card>
    </div >
  );
}
