import { query, initDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
    const { method } = req;

    try {
        await initDatabase();

        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        switch (method) {
            case 'GET': {
                const result = await query(
                    'SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC',
                    [user.id]
                );
                return res.status(200).json(result.rows);
            }

            case 'POST': {
                const { category, amount, period, startDate } = req.body;

                if (!category || !amount || !period || !startDate) {
                    return res.status(400).json({
                        message: 'Category, amount, period, and startDate are required',
                    });
                }

                const result = await query(
                    `INSERT INTO budgets (
            user_id, category, amount, period, start_date
          ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                    [user.id, category, amount, period, startDate]
                );

                return res.status(201).json(result.rows[0]);
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Budgets API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
