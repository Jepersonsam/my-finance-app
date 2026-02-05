import { query } from '@/lib/db';

export default async function handler(req, res) {
    try {
        const result = await query('SELECT NOW() as now');
        res.status(200).json({
            status: 'success',
            message: 'Database connection successful',
            time: result.rows[0].now
        });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
