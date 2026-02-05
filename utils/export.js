import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDateShort } from './format';

export const exportToExcel = (data, fileName) => {
    // Format data for Excel
    const formattedData = data.map((item) => ({
        Tanggal: formatDateShort(item.date),
        Keterangan: item.description,
        Kategori: item.category,
        Tipe: item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Jumlah: item.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data, fileName, title) => {
    const doc = new jsPDF();

    // Add Validation
    if (!Array.isArray(data) || data.length === 0) {
        alert("Tidak ada data untuk diexport");
        return;
    }

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    // Table Column
    const tableColumn = ["Tanggal", "Keterangan", "Kategori", "Tipe", "Jumlah"];

    // Table Rows
    const tableRows = [];

    data.forEach(item => {
        const transactionData = [
            formatDateShort(item.date),
            item.description,
            item.category,
            item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            formatCurrency(item.amount)
        ];
        tableRows.push(transactionData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 133, 244] }, // Google Blue
    });

    doc.save(`${fileName}.pdf`);
};
