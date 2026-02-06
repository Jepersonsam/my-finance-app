import { useState, useEffect } from 'react';
import { debtAPI } from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { formatCurrency, formatDateShort, formatNumberInput, parseNumberInput } from '@/utils/format';
import { useNotification } from '@/contexts/NotificationContext';

const DEBT_TYPES = [
  { value: 'personal', label: 'Utang Pribadi' },
  { value: 'credit_card', label: 'Kartu Kredit' },
  { value: 'loan', label: 'Pinjaman' },
  { value: 'other', label: 'Lainnya' },
];

export default function Debts() {
  const { notify } = useNotification();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    totalAmount: '',
    paidAmount: '0',
    dueDate: '',
    interestRate: '0',
    reminder: true,
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const data = await debtAPI.getAll();
      const formattedData = Array.isArray(data)
        ? data.map((d) => ({
          ...d,
          totalAmount: d.total_amount,
          paidAmount: d.paid_amount,
          dueDate: d.due_date,
          interestRate: d.interest_rate,
        }))
        : [];
      setDebts(formattedData);
    } catch (error) {
      console.error('Error loading debts:', error);
      setDebts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'totalAmount' || name === 'paidAmount') {
      const formatted = formatNumberInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
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
    if (!formData.name) newErrors.name = 'Nama utang wajib diisi';
    if (!formData.type) newErrors.type = 'Tipe utang wajib diisi';
    const totalValue = parseNumberInput(formData.totalAmount);
    if (!formData.totalAmount || totalValue <= 0)
      newErrors.totalAmount = 'Total jumlah wajib diisi dan harus lebih dari 0';
    if (!formData.dueDate) newErrors.dueDate = 'Tanggal jatuh tempo wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const debt = {
        ...formData,
        totalAmount: parseNumberInput(formData.totalAmount),
        paidAmount: parseNumberInput(formData.paidAmount || '0'),
        interestRate: parseFloat(formData.interestRate || 0),
      };

      if (editingId) {
        await debtAPI.update(editingId, debt);
        notify.success('Utang berhasil diperbarui');
      } else {
        await debtAPI.create(debt);
        notify.success('Utang berhasil disimpan');
      }

      setFormData({
        name: '',
        type: '',
        totalAmount: '',
        paidAmount: '0',
        dueDate: '',
        interestRate: '0',
        reminder: true,
        description: '',
      });
      setShowForm(false);
      setEditingId(null);
      loadDebts();
    } catch (error) {
      console.error('Error saving debt:', error);
      notify.error('Gagal menyimpan utang');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (debt) => {
    // Ensure values are integers to prevent decimal issues
    const totalAmountInt = Math.round(parseFloat(debt.totalAmount) || 0);
    const paidAmountInt = Math.round(parseFloat(debt.paidAmount) || 0);

    setFormData({
      name: debt.name,
      type: debt.type,
      totalAmount: formatNumberInput(totalAmountInt.toString()),
      paidAmount: formatNumberInput(paidAmountInt.toString()),
      dueDate: debt.dueDate.split('T')[0],
      interestRate: debt.interestRate?.toString() || '0',
      reminder: debt.reminder || false,
      description: debt.description || '',
    });
    setEditingId(debt.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus utang ini?')) {
      try {
        await debtAPI.delete(id);
        notify.success('Utang berhasil dihapus');
        loadDebts();
      } catch (error) {
        console.error('Error deleting debt:', error);
        notify.error('Gagal menghapus utang');
      }
    }
  };

  const handlePayment = async (id, amount) => {
    try {
      const debt = debts.find((d) => d.id === id);
      if (debt) {
        const newPaidAmount = debt.paidAmount + parseFloat(amount);
        await debtAPI.update(id, {
          name: debt.name,
          type: debt.type,
          totalAmount: debt.totalAmount,
          paidAmount: newPaidAmount,
          dueDate: debt.dueDate,
          interestRate: debt.interestRate,
          reminder: debt.reminder,
          description: debt.description,
        });
        notify.success('Pembayaran berhasil dicatat');
        loadDebts();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      notify.error('Gagal memproses pembayaran');
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalWithInterest = (amount, interestRate) => {
    return amount + (amount * interestRate) / 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pengelolaan Utang</h1>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              type: '',
              totalAmount: '',
              paidAmount: '0',
              dueDate: '',
              interestRate: '0',
              reminder: true,
              description: '',
            });
          }}
        >
          {showForm ? 'Batal' : '+ Tambah Utang'}
        </Button>
      </div>

      {showForm && (
        <Card title={editingId ? 'Edit Utang' : 'Tambah Utang Baru'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Utang"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Kartu Kredit Bank ABC"
              error={errors.name}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipe Utang"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={DEBT_TYPES}
                error={errors.type}
                required
              />

              <Input
                label="Bunga (%)"
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                placeholder="0"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Total Jumlah"
                type="text"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="0"
                error={errors.totalAmount}
                required
              />

              <Input
                label="Jumlah Terbayar"
                type="text"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <Input
              label="Tanggal Jatuh Tempo"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
              required
            />

            <Input
              label="Keterangan"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi utang"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminder"
                name="reminder"
                checked={formData.reminder}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="reminder" className="text-sm text-gray-700">
                Aktifkan pengingat pembayaran
              </label>
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

      <Card title="Daftar Utang">
        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : debts.length > 0 ? (
          <div className="space-y-4">
            {debts.map((debt) => {
              const daysUntilDue = getDaysUntilDue(debt.dueDate);
              const totalAmount = parseFloat(debt.totalAmount) || 0;
              const paidAmount = parseFloat(debt.paidAmount) || 0;
              const interestRate = parseFloat(debt.interestRate) || 0;

              const remaining = totalAmount - paidAmount;
              const totalWithInterest = calculateTotalWithInterest(
                remaining,
                interestRate
              );
              const isCompleted = paidAmount >= totalAmount;
              const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
              const debtTypeLabel =
                DEBT_TYPES.find((t) => t.value === debt.type)?.label || debt.type;

              return (
                <div
                  key={debt.id}
                  className={`border rounded-lg p-4 ${isDueSoon ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {debt.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {debtTypeLabel}
                        {debt.interestRate > 0 && ` • Bunga: ${debt.interestRate}%`}
                      </p>
                      {debt.description && (
                        <p className="text-sm text-gray-600 mt-1">{debt.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(debt)}
                        className="text-primary-600 hover:text-primary-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(debt.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Total Utang</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Terbayar</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sisa Utang</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(Math.max(remaining, 0))}
                      </p>
                    </div>
                    {interestRate > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Dengan Bunga</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {formatCurrency(totalWithInterest)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress Pembayaran</span>
                      <span className="font-medium">
                        {formatCurrency(paidAmount)} /{' '}
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary-500"
                        style={{
                          width: `${(paidAmount / totalAmount) * 100
                            }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Jatuh Tempo: {formatDateShort(debt.dueDate)}
                      </p>
                      {isDueSoon && !isCompleted && (
                        <p className="text-sm text-yellow-600 font-medium mt-1">
                          ⚠️ Jatuh tempo dalam {daysUntilDue} hari!
                        </p>
                      )}
                      {daysUntilDue < 0 && !isCompleted && (
                        <p className="text-sm text-red-600 font-medium mt-1">
                          ⚠️ Telat {Math.abs(daysUntilDue)} hari!
                        </p>
                      )}
                    </div>
                    {!isCompleted && (
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Jumlah bayar"
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          id={`payment-${debt.id}`}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(`payment-${debt.id}`);
                            if (input && input.value) {
                              handlePayment(debt.id, input.value);
                              input.value = '';
                            }
                          }}
                        >
                          Bayar
                        </Button>
                      </div>
                    )}
                  </div>

                  {isCompleted && (
                    <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm font-medium">
                      ✅ Utang telah lunas!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada utang. Tambahkan utang pertama Anda.
          </div>
        )}
      </Card>
    </div>
  );
}
