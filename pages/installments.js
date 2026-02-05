import { useState, useEffect } from 'react';
import { installmentAPI } from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { formatCurrency, formatDateShort, formatNumberInput, parseNumberInput } from '@/utils/format';
import { useNotification } from '@/contexts/NotificationContext';

export default function Installments() {
  const { notify } = useNotification();
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    paidAmount: '0',
    installments: '',
    dueDate: '',
    reminder: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    try {
      const data = await installmentAPI.getAll();
      const formattedData = Array.isArray(data)
        ? data.map((i) => ({
          ...i,
          totalAmount: i.total_amount,
          paidAmount: i.paid_amount,
          currentInstallment: i.current_installment,
          dueDate: i.due_date,
        }))
        : [];
      setInstallments(formattedData);
    } catch (error) {
      console.error('Error loading installments:', error);
      setInstallments([]);
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
    if (!formData.name) newErrors.name = 'Nama cicilan wajib diisi';
    const totalValue = parseNumberInput(formData.totalAmount);
    if (!formData.totalAmount || totalValue <= 0)
      newErrors.totalAmount = 'Total jumlah wajib diisi dan harus lebih dari 0';
    if (!formData.installments || formData.installments <= 0)
      newErrors.installments = 'Jumlah cicilan wajib diisi';
    if (!formData.dueDate) newErrors.dueDate = 'Tanggal jatuh tempo wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const installment = {
        ...formData,
        totalAmount: parseNumberInput(formData.totalAmount),
        paidAmount: parseNumberInput(formData.paidAmount || '0'),
        installments: parseInt(formData.installments),
      };

      if (editingId) {
        await installmentAPI.update(editingId, installment);
        notify.success('Cicilan berhasil diperbarui');
      } else {
        await installmentAPI.create(installment);
        notify.success('Cicilan berhasil disimpan');
      }

      setFormData({
        name: '',
        totalAmount: '',
        paidAmount: '0',
        installments: '',
        dueDate: '',
        reminder: true,
      });
      setShowForm(false);
      setEditingId(null);
      loadInstallments();
    } catch (error) {
      console.error('Error saving installment:', error);
      notify.error('Gagal menyimpan cicilan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (installment) => {
    setFormData({
      name: installment.name,
      totalAmount: formatNumberInput(installment.totalAmount.toString()),
      paidAmount: formatNumberInput(installment.paidAmount.toString()),
      installments: installment.installments.toString(),
      dueDate: installment.dueDate.split('T')[0],
      reminder: installment.reminder || false,
    });
    setEditingId(installment.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus cicilan ini?')) {
      try {
        await installmentAPI.delete(id);
        notify.success('Cicilan berhasil dihapus');
        loadInstallments();
      } catch (error) {
        console.error('Error deleting installment:', error);
        notify.error('Gagal menghapus cicilan');
      }
    }
  };

  const handlePayment = async (id, amount) => {
    try {
      const installment = installments.find((i) => i.id === id);
      if (installment) {
        const newPaidAmount = installment.paidAmount + parseFloat(amount);
        const newCurrentInstallment = Math.min(
          installment.currentInstallment + 1,
          installment.installments
        );
        await installmentAPI.update(id, {
          ...installment,
          paidAmount: newPaidAmount,
          currentInstallment: newCurrentInstallment,
        });
        notify.success('Pembayaran berhasil dicatat');
        loadInstallments();
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

  const getInstallmentAmount = (totalAmount, installments) => {
    return totalAmount / installments;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pembayaran Cicilan</h1>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              totalAmount: '',
              paidAmount: '0',
              installments: '',
              dueDate: '',
              reminder: true,
            });
          }}
        >
          {showForm ? 'Batal' : '+ Tambah Cicilan'}
        </Button>
      </div>

      {showForm && (
        <Card title={editingId ? 'Edit Cicilan' : 'Tambah Cicilan Baru'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Cicilan"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Kredit Motor"
              error={errors.name}
              required
            />

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
                label="Jumlah Cicilan"
                type="number"
                name="installments"
                value={formData.installments}
                onChange={handleChange}
                placeholder="12"
                error={errors.installments}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Jumlah Terbayar"
                type="text"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                placeholder="0"
              />

              <Input
                label="Tanggal Jatuh Tempo"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                error={errors.dueDate}
                required
              />
            </div>

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

      <Card title="Daftar Cicilan">
        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : installments.length > 0 ? (
          <div className="space-y-4">
            {installments.map((installment) => {
              const daysUntilDue = getDaysUntilDue(installment.dueDate);
              const totalAmount = parseFloat(installment.totalAmount) || 0;
              const paidAmount = parseFloat(installment.paidAmount) || 0;
              const numInstallments = parseInt(installment.installments) || 1;

              const installmentAmount = getInstallmentAmount(
                totalAmount,
                numInstallments
              );
              const remaining = totalAmount - paidAmount;
              const isCompleted = paidAmount >= totalAmount;
              const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

              return (
                <div
                  key={installment.id}
                  className={`border rounded-lg p-4 ${isDueSoon ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {installment.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Cicilan {installment.currentInstallment || 0} /{' '}
                        {numInstallments}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(installment)}
                        className="text-primary-600 hover:text-primary-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(installment.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
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
                      <p className="text-sm text-gray-600">Sisa</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(Math.max(remaining, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Per Cicilan</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(installmentAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
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
                        Jatuh Tempo: {formatDateShort(installment.dueDate)}
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
                          id={`payment-${installment.id}`}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(
                              `payment-${installment.id}`
                            );
                            if (input && input.value) {
                              handlePayment(installment.id, input.value);
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
                      ✅ Cicilan telah lunas!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada cicilan. Tambahkan cicilan pertama Anda.
          </div>
        )}
      </Card>
    </div>
  );
}
