import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { formatCurrency } from '@/utils/format';

const FORECAST_PERIODS = [
  { value: '1', label: '1 Bulan ke Depan' },
  { value: '3', label: '3 Bulan ke Depan' },
  { value: '6', label: '6 Bulan ke Depan' },
  { value: '12', label: '1 Tahun ke Depan' },
];

export default function Forecast() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forecastPeriod, setForecastPeriod] = useState('3');

  useEffect(() => {
    loadTransactions();
  }, []);

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

  // Calculate average monthly income and expense
  const calculateAverages = () => {
    const monthlyData = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      const amount = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expense += amount;
      }
    });

    const months = Object.keys(monthlyData);
    if (months.length === 0) return { avgIncome: 0, avgExpense: 0 };

    const totalIncome = months.reduce(
      (sum, month) => sum + monthlyData[month].income,
      0
    );
    const totalExpense = months.reduce(
      (sum, month) => sum + monthlyData[month].expense,
      0
    );

    return {
      avgIncome: totalIncome / months.length,
      avgExpense: totalExpense / months.length,
    };
  };

  const { avgIncome, avgExpense } = calculateAverages();

  // Generate forecast data
  const generateForecast = () => {
    const periods = parseInt(forecastPeriod);
    const forecastData = [];
    const currentDate = new Date();

    for (let i = 1; i <= periods; i++) {
      const forecastDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i,
        1
      );
      const monthName = forecastDate.toLocaleDateString('id-ID', {
        month: 'short',
      });

      // Simple linear trend (can be improved with more sophisticated algorithms)
      const trendFactor = 1 + (i - 1) * 0.02; // 2% increase per month
      const forecastIncome = avgIncome * trendFactor;
      const forecastExpense = avgExpense * trendFactor;

      forecastData.push({
        month: monthName,
        predictedIncome: Math.round(forecastIncome),
        predictedExpense: Math.round(forecastExpense),
        predictedBalance: Math.round(forecastIncome - forecastExpense),
      });
    }

    return forecastData;
  };

  const forecastData = generateForecast();

  // Calculate total forecast
  const totalForecastIncome = forecastData.reduce(
    (sum, item) => sum + item.predictedIncome,
    0
  );
  const totalForecastExpense = forecastData.reduce(
    (sum, item) => sum + item.predictedExpense,
    0
  );
  const totalForecastBalance = totalForecastIncome - totalForecastExpense;

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations = [];
    const avgBalance = totalForecastBalance / parseInt(forecastPeriod);

    if (avgBalance < 0) {
      recommendations.push({
        type: 'warning',
        title: 'Perkiraan Defisit',
        message:
          'Berdasarkan tren saat ini, Anda diperkirakan akan mengalami defisit. Pertimbangkan untuk mengurangi pengeluaran atau meningkatkan pemasukan.',
      });
    } else if (avgBalance < avgIncome * 0.2) {
      recommendations.push({
        type: 'info',
        title: 'Tingkat Tabungan Rendah',
        message:
          'Tingkat tabungan diperkirakan rendah. Pertimbangkan untuk meningkatkan tabungan minimal 20% dari pemasukan.',
      });
    } else {
      recommendations.push({
        type: 'success',
        title: 'Proyeksi Keuangan Baik',
        message:
          'Berdasarkan tren saat ini, proyeksi keuangan Anda baik. Pertahankan kebiasaan finansial ini!',
      });
    }

    if (avgExpense > avgIncome * 0.8) {
      recommendations.push({
        type: 'warning',
        title: 'Pengeluaran Tinggi',
        message:
          'Rasio pengeluaran terhadap pemasukan tinggi. Pertimbangkan untuk mengoptimalkan pengeluaran.',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Prediksi Keuangan</h1>
        <Select
          name="forecastPeriod"
          value={forecastPeriod}
          onChange={(e) => setForecastPeriod(e.target.value)}
          options={FORECAST_PERIODS}
          className="w-48"
        />
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Pemasukan Prediksi</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalForecastIncome)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Rata-rata: {formatCurrency(totalForecastIncome / parseInt(forecastPeriod))}
              /bulan
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Pengeluaran Prediksi</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalForecastExpense)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Rata-rata: {formatCurrency(totalForecastExpense / parseInt(forecastPeriod))}
              /bulan
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Saldo Prediksi</p>
            <p
              className={`text-2xl font-bold ${totalForecastBalance >= 0 ? 'text-primary-600' : 'text-red-600'
                }`}
            >
              {formatCurrency(totalForecastBalance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Rata-rata: {formatCurrency(totalForecastBalance / parseInt(forecastPeriod))}
              /bulan
            </p>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card title="Rekomendasi">
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${rec.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : rec.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
              >
                <h4
                  className={`font-semibold mb-2 ${rec.type === 'success'
                      ? 'text-green-800'
                      : rec.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                    }`}
                >
                  {rec.title}
                </h4>
                <p
                  className={`text-sm ${rec.type === 'success'
                      ? 'text-green-700'
                      : rec.type === 'warning'
                        ? 'text-yellow-700'
                        : 'text-blue-700'
                    }`}
                >
                  {rec.message}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Prediksi Pemasukan vs Pengeluaran">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="predictedIncome"
                stroke="#10b981"
                name="Prediksi Pemasukan"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="predictedExpense"
                stroke="#ef4444"
                name="Prediksi Pengeluaran"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Prediksi Saldo Bulanan">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar
                dataKey="predictedBalance"
                fill="#0ea5e9"
                name="Prediksi Saldo"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Forecast Table */}
      <Card title="Rincian Prediksi Bulanan">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bulan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Prediksi Pemasukan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Prediksi Pengeluaran
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Prediksi Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forecastData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                    {formatCurrency(item.predictedIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                    {formatCurrency(item.predictedExpense)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${item.predictedBalance >= 0 ? 'text-primary-600' : 'text-red-600'
                      }`}
                  >
                    {formatCurrency(item.predictedBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Catatan">
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            • Prediksi ini didasarkan pada analisis tren data historis transaksi Anda.
          </p>
          <p>
            • Prediksi dapat berubah tergantung pada perubahan pola pengeluaran dan
            pemasukan Anda.
          </p>
          <p>
            • Disarankan untuk meninjau prediksi secara berkala dan menyesuaikan
            anggaran sesuai kebutuhan.
          </p>
        </div>
      </Card>
    </div>
  );
}
