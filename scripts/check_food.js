const { Pool } = require('pg');

const connectionString = 'postgresql://postgres:L5lu6vZeM27l9UPu@db.mbjyakpwfpveatdsbkzp.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function checkFood() {
    try {
        const res = await pool.query("SELECT id, date, amount, description, type FROM transactions WHERE category = 'Makanan' AND type = 'expense'");
        console.log('--- DATA TRANSAKSI KATEGORI MAKANAN (JSON) ---');
        console.log(JSON.stringify(res.rows, null, 2));

        const total = res.rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        console.log('---------------------------------------');
        console.log(`TOTAL: ${total}`);
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await pool.end();
    }
}

checkFood();
