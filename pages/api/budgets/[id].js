import { query, initDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
    const { method } = req;
    const { id } = req.query;

    try {
        await initDatabase();

        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check ownership
        const checkResult = await query(
            'SELECT id FROM budgets WHERE id = $1 AND user_id = $2',
            [id, user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        switch (method) {
            case 'GET': {
                const result = await query(
                    'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
                    [id, user.id]
                );
                return res.status(200).json(result.rows[0]);
            }

            case 'PUT': {
                const { category, amount, period, startDate } = req.body;

                if (!category || !amount || !period || !startDate) {
                    return res.status(400).json({
                        message: 'Category, amount, period, and startDate are required',
                    });
                }

                const result = await query(
                    `UPDATE budgets SET 
            category = $1, amount = $2, period = $3, start_date = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5 AND user_id = $6 RETURNING *`,
                    [category, amount, period, startDate, id, user.id]
                );

                return res.status(200).json(result.rows[0]);
            }

            case 'DELETE': {
                await query('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [
                    id,
                    user.id,
                ]);
                return res
                    .status(200)
                    .json({ message: 'Budget deleted successfully' });
            }

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Budgets API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
