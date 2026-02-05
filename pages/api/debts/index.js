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
                    'SELECT * FROM debts WHERE user_id = $1 ORDER BY created_at DESC',
                    [user.id]
                );
                return res.status(200).json(result.rows);
            }

            case 'POST': {
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
                    `INSERT INTO debts (
            user_id, name, type, total_amount, paid_amount, 
            due_date, interest_rate, reminder, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                    [
                        user.id,
                        name,
                        type,
                        totalAmount,
                        paidAmount || 0,
                        dueDate,
                        interestRate || 0,
                        reminder ?? true,
                        description || '',
                    ]
                );

                return res.status(201).json(result.rows[0]);
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Debts API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
