import { useState, useEffect } from 'react';
import {
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
  LineChart,
  Line,
} from 'recharts';
import { transactionAPI } from '@/lib/api';
import Card from '@/components/Card';
import Select from '@/components/Select';
import { formatCurrency, calculatePercentage } from '@/utils/format';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'quarter', label: 'Kuartal Ini' },
  { value: 'year', label: 'Tahun Ini' },
];

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analysis() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadTransactions();
  }, [period]);

  const loadTransactions = async () => {
    try {
      const data = await transactionAPI.getAll();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analysis data
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Category breakdown
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

  // Sort by value
  categoryData.sort((a, b) => b.value - a.value);

  // Monthly trend (simulated)
  const monthlyTrend = [
    { month: 'Okt', income: 4500000, expense: 900000 },
    { month: 'Nov', income: 4800000, expense: 950000 },
    { month: 'Des', income: 5000000, expense: 1000000 },
    { month: 'Jan', income: 5000000, expense: 1150000 },
  ];

  // Top spending categories
  const topCategories = categoryData.slice(0, 5);

  // Spending insights
  const getSpendingInsights = () => {
    const insights = [];
    if (savingsRate < 0) {
      insights.push({
        type: 'warning',
        message: 'Pengeluaran melebihi pemasukan. Perlu mengurangi pengeluaran.',
      });
    } else if (savingsRate < 20) {
      insights.push({
        type: 'info',
        message: 'Tingkat tabungan rendah. Pertimbangkan untuk meningkatkan tabungan.',
      });
    } else {
      insights.push({
        type: 'success',
        message: 'Tingkat tabungan baik. Pertahankan kebiasaan finansial ini!',
      });
    }

    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      const topPercentage = (topCategory.value / totalExpense) * 100;
      if (topPercentage > 40) {
        insights.push({
          type: 'warning',
          message: `${topCategory.name} mengambil ${topPercentage.toFixed(1)}% dari total pengeluaran. Pertimbangkan untuk mengurangi.`,
        });
      }
    }

    return insights;
  };

  const insights = getSpendingInsights();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analisis Keuangan</h1>
        <Select
          name="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={PERIOD_OPTIONS}
          className="w-48"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Saldo</p>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? 'text-primary-600' : 'text-red-600'
                }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Tingkat Tabungan</p>
            <p
              className={`text-2xl font-bold ${savingsRate >= 20
                ? 'text-green-600'
                : savingsRate >= 0
                  ? 'text-yellow-600'
                  : 'text-red-600'
                }`}
            >
              {savingsRate.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card title="Wawasan Keuangan">
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${insight.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : insight.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}
              >
                <p className="font-medium">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tren Bulanan">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
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

        <Card title="Distribusi Pengeluaran per Kategori">
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

      {/* Category Analysis */}
      {categoryData.length > 0 && (
        <Card title="Analisis Kategori Pengeluaran">
          <div className="space-y-4">
            {categoryData.map((item, index) => {
              const percentage = (item.value / totalExpense) * 100;
              return (
                <div key={item.name}>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
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

      {/* Top Spending Categories */}
      {topCategories.length > 0 && (
        <Card title="5 Kategori Pengeluaran Terbesar">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
