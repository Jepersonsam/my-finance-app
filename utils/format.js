/**
 * Format utility functions untuk aplikasi keuangan
 */

/**
 * Format mata uang Rupiah
 * @param {number} amount - Jumlah uang
 * @returns {string} String yang sudah diformat
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 * @param {Date|string} date - Tanggal yang akan diformat
 * @returns {string} String tanggal yang sudah diformat
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format tanggal ke format pendek (DD/MM/YYYY)
 * @param {Date|string} date - Tanggal yang akan diformat
 * @returns {string} String tanggal yang sudah diformat
 */
export function formatDateShort(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Validasi email
 * @param {string} email - Email yang akan divalidasi
 * @returns {boolean} True jika valid
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validasi password (minimal 6 karakter)
 * @param {string} password - Password yang akan divalidasi
 * @returns {boolean} True jika valid
 */
export function validatePassword(password) {
  return password.length >= 6;
}

/**
 * Hitung persentase
 * @param {number} value - Nilai saat ini
 * @param {number} total - Total nilai
 * @returns {number} Persentase
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format persentase
 * @param {number} percentage - Persentase
 * @returns {string} String persentase dengan simbol %
 */
export function formatPercentage(percentage) {
  return `${percentage}%`;
}

/**
 * Format input angka dengan titik sebagai pemisah ribuan
 * @param {string} value - Nilai input
 * @returns {string} String yang sudah diformat dengan titik
 */
export function formatNumberInput(value) {
  // Hapus semua karakter selain angka
  const numbers = value.replace(/\D/g, '');

  // Jika kosong, return empty string
  if (!numbers) return '';

  // Format dengan titik sebagai pemisah ribuan
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse input angka yang diformat dengan titik menjadi number
 * @param {string} value - Nilai input yang diformat
 * @returns {number} Angka yang sudah diparsing
 */
export function parseNumberInput(value) {
  // Hapus semua titik
  const numbers = value.replace(/\./g, '');
  return parseFloat(numbers) || 0;
}

