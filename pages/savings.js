import { useState, useEffect } from 'react';
import { savingsAPI } from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { formatCurrency, calculatePercentage, formatPercentage, formatNumberInput, parseNumberInput } from '@/utils/format';
import { useNotification } from '@/contexts/NotificationContext';

export default function Savings() {
  const { notify } = useNotification();
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    autoSave: false,
    autoSaveAmount: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSavings();
  }, []);

  const loadSavings = async () => {
    try {
      const data = await savingsAPI.getAll();
      const formattedData = Array.isArray(data)
        ? data.map((s) => ({
          ...s,
          targetAmount: s.target_amount,
          currentAmount: s.current_amount,
          targetDate: s.target_date,
          autoSave: s.auto_save,
          autoSaveAmount: s.auto_save_amount,
        }))
        : [];
      setSavings(formattedData);
    } catch (error) {
      console.error('Error loading savings:', error);
      setSavings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'targetAmount' || name === 'currentAmount' || name === 'autoSaveAmount') {
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
    if (!formData.name) newErrors.name = 'Nama tujuan wajib diisi';
    const targetValue = parseNumberInput(formData.targetAmount);
    if (!formData.targetAmount || targetValue <= 0)
      newErrors.targetAmount = 'Target jumlah wajib diisi dan harus lebih dari 0';
    if (!formData.targetDate) newErrors.targetDate = 'Tanggal target wajib diisi';
    const autoSaveValue = parseNumberInput(formData.autoSaveAmount);
    if (formData.autoSave && (!formData.autoSaveAmount || autoSaveValue <= 0))
      newErrors.autoSaveAmount = 'Jumlah auto save wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const saving = {
        ...formData,
        targetAmount: parseNumberInput(formData.targetAmount),
        currentAmount: parseNumberInput(formData.currentAmount || '0'),
        autoSaveAmount: formData.autoSave
          ? parseNumberInput(formData.autoSaveAmount || '0')
          : 0,
      };

      if (editingId) {
        await savingsAPI.update(editingId, saving);
        notify.success('Tujuan tabungan berhasil diperbarui');
      } else {
        await savingsAPI.create(saving);
        notify.success('Tujuan tabungan berhasil disimpan');
      }

      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        autoSave: false,
        autoSaveAmount: '',
      });
      setShowForm(false);
      setEditingId(null);
      loadSavings();
    } catch (error) {
      console.error('Error saving saving goal:', error);
      notify.error('Gagal menyimpan tujuan tabungan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (saving) => {
    // Ensure values are integers to prevent decimal issues
    const targetAmountInt = Math.round(parseFloat(saving.targetAmount) || 0);
    const currentAmountInt = Math.round(parseFloat(saving.currentAmount) || 0);
    const autoSaveAmountInt = saving.autoSaveAmount ? Math.round(parseFloat(saving.autoSaveAmount) || 0) : 0;

    setFormData({
      name: saving.name,
      targetAmount: formatNumberInput(targetAmountInt.toString()),
      currentAmount: formatNumberInput(currentAmountInt.toString()),
      targetDate: saving.targetDate.split('T')[0],
      autoSave: saving.autoSave || false,
      autoSaveAmount: autoSaveAmountInt > 0 ? formatNumberInput(autoSaveAmountInt.toString()) : '',
    });
    setEditingId(saving.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus tujuan tabungan ini?')) {
      try {
        await savingsAPI.delete(id);
        notify.success('Tujuan tabungan berhasil dihapus');
        loadSavings();
      } catch (error) {
        console.error('Error deleting saving:', error);
        notify.error('Gagal menghapus tujuan tabungan');
      }
    }
  };

  const handleAddAmount = async (id, amount) => {
    try {
      const saving = savings.find((s) => s.id === id);
      if (saving) {
        const newAmount = saving.currentAmount + parseFloat(amount);
        await savingsAPI.update(id, {
          name: saving.name,
          targetAmount: saving.targetAmount,
          currentAmount: newAmount,
          targetDate: saving.targetDate,
          autoSave: saving.autoSave,
          autoSaveAmount: saving.autoSaveAmount,
        });
        notify.success('Jumlah berhasil ditambahkan');
        loadSavings();
      }
    } catch (error) {
      console.error('Error adding amount:', error);
      notify.error('Gagal menambahkan jumlah');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tabungan</h1>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              targetAmount: '',
              currentAmount: '0',
              targetDate: '',
              autoSave: false,
              autoSaveAmount: '',
            });
          }}
        >
          {showForm ? 'Batal' : '+ Tambah Tujuan Tabungan'}
        </Button>
      </div>

      {showForm && (
        <Card title={editingId ? 'Edit Tujuan Tabungan' : 'Tambah Tujuan Tabungan Baru'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Tujuan"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Liburan ke Bali"
              error={errors.name}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Target Jumlah"
                type="text"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="0"
                error={errors.targetAmount}
                required
              />

              <Input
                label="Jumlah Saat Ini"
                type="text"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <Input
              label="Tanggal Target"
              type="date"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              error={errors.targetDate}
              required
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                name="autoSave"
                checked={formData.autoSave}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="autoSave" className="text-sm text-gray-700">
                Aktifkan penyimpanan otomatis
              </label>
            </div>

            {formData.autoSave && (
              <Input
                label="Jumlah Auto Save"
                type="text"
                name="autoSaveAmount"
                value={formData.autoSaveAmount}
                onChange={handleChange}
                placeholder="0"
                error={errors.autoSaveAmount}
              />
            )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8">Memuat data...</div>
        ) : savings.length > 0 ? (
          savings.map((saving) => {
            const currentAmount = parseFloat(saving.currentAmount) || 0;
            const targetAmount = parseFloat(saving.targetAmount) || 0;
            const autoSaveAmount = parseFloat(saving.autoSaveAmount) || 0;

            const percentage = calculatePercentage(
              currentAmount,
              targetAmount
            );
            const remaining = targetAmount - currentAmount;
            const isCompleted = currentAmount >= targetAmount;

            return (
              <Card key={saving.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {saving.name}
                    </h3>
                    {saving.autoSave && (
                      <p className="text-sm text-gray-500 mt-1">
                        Auto save: {formatCurrency(autoSaveAmount)}/bulan
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(saving)}
                      className="text-primary-600 hover:text-primary-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(saving.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {formatCurrency(currentAmount)} /{' '}
                      {formatCurrency(targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">
                      Sisa: {formatCurrency(Math.max(remaining, 0))}
                    </span>
                    <span className="font-semibold text-primary-600">
                      {formatPercentage(percentage)}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Target: {new Date(saving.targetDate).toLocaleDateString('id-ID')}
                </div>

                {!isCompleted && (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Tambah jumlah"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      id={`add-amount-${saving.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(
                          `add-amount-${saving.id}`
                        );
                        if (input && input.value) {
                          handleAddAmount(saving.id, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Tambah
                    </Button>
                  </div>
                )}

                {isCompleted && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm font-medium">
                    🎉 Tujuan tercapai!
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            Belum ada tujuan tabungan. Tambahkan tujuan tabungan pertama Anda.
          </div>
        )}
      </div>
    </div>
  );
}
