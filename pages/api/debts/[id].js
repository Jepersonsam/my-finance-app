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
            'SELECT id FROM debts WHERE id = $1 AND user_id = $2',
            [id, user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Debt not found' });
        }

        switch (method) {
            case 'GET': {
                const result = await query(
                    'SELECT * FROM debts WHERE id = $1 AND user_id = $2',
                    [id, user.id]
                );
                return res.status(200).json(result.rows[0]);
            }

            case 'PUT': {
                const {
                    name,
                    type,
                    totalAmount,
                    paidAmount,
                    dueDate,
                    interestRate,
                    reminder,
                    description,
                } = req.body;

                if (!name || !type || !totalAmount || !dueDate) {
                    return res.status(400).json({
                        message: 'Name, type, totalAmount, and dueDate are required',
                    });
                }

                const result = await query(
                    `UPDATE debts SET 
            name = $1, type = $2, total_amount = $3, paid_amount = $4, 
            due_date = $5, interest_rate = $6, reminder = $7, description = $8,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $9 AND user_id = $10 RETURNING *`,
                    [
                        name,
                        type,
                        totalAmount,
                        paidAmount || 0,
                        dueDate,
                        interestRate || 0,
                        reminder ?? true,
                        description || '',
                        id,
                        user.id,
                    ]
                );

                return res.status(200).json(result.rows[0]);
            }

            case 'DELETE': {
                await query('DELETE FROM debts WHERE id = $1 AND user_id = $2', [
                    id,
                    user.id,
                ]);
                return res
                    .status(200)
                    .json({ message: 'Debt deleted successfully' });
            }

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Debts API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
