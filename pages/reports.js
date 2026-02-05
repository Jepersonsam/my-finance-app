import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { transactionAPI } from '@/lib/api';
import Card from '@/components/Card';
import Select from '@/components/Select';
import { formatCurrency, formatDateShort } from '@/utils/format';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Custom' },
];

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
    loadTransactions();
  }, []);

  useEffect(() => {
    if (period !== 'custom') {
      loadTransactions();
    }
  }, [period]);

  const loadTransactions = async () => {
    try {
      let data;
      if (period === 'custom' && startDate && endDate) {
        data = await transactionAPI.getByDateRange(startDate, endDate);
      } else {
        data = await transactionAPI.getAll();
      }
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (e) => {
    const selectedPeriod = e.target.value;
    setPeriod(selectedPeriod);

    const now = new Date();
    let start, end;

    switch (selectedPeriod) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleCustomDateFilter = () => {
    if (startDate && endDate) {
      loadTransactions();
    }
  };

  // Calculate summary
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const balance = totalIncome - totalExpense;

  // Prepare chart data
  const categoryData = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      const existing = acc.find((item) => item.name === transaction.category);
      if (existing) {
        existing.value += amount;
      } else {
        acc.push({ name: transaction.category, value: amount });
      }
      return acc;
    }, []);

  const dailyData = [
    { name: 'Sen', income: 0, expense: 0 },
    { name: 'Sel', income: 0, expense: 0 },
    { name: 'Rab', income: 0, expense: 0 },
    { name: 'Kam', income: 0, expense: 0 },
    { name: 'Jum', income: totalIncome, expense: totalExpense },
    { name: 'Sab', income: 0, expense: 0 },
    { name: 'Min', income: 0, expense: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
      </div>

      {/* Filter */}
      <Card title="Filter Periode">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Periode"
            name="period"
            value={period}
            onChange={handlePeriodChange}
            options={PERIOD_OPTIONS}
          />
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCustomDateFilter}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Terapkan
                </button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Pemasukan</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Pengeluaran</p>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Saldo</p>
            <p
              className={`text-3xl font-bold ${balance >= 0 ? 'text-primary-600' : 'text-red-600'
                }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Grafik Pemasukan vs Pengeluaran">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                name="Pemasukan"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                name="Pengeluaran"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Pengeluaran per Kategori">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Belum ada data pengeluaran
            </div>
          )}
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card title="Rincian Pengeluaran per Kategori">
          <div className="space-y-4">
            {categoryData.map((item, index) => {
              const percentage = (item.value / totalExpense) * 100;
              return (
                <div key={item.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
