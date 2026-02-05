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
                    'SELECT * FROM savings WHERE user_id = $1 ORDER BY created_at DESC',
                    [user.id]
                );
                return res.status(200).json(result.rows);
            }

            case 'POST': {
                const {
                    name,
                    targetAmount,
                    currentAmount,
                    targetDate,
                    autoSave,
                    autoSaveAmount,
                } = req.body;

                if (!name || !targetAmount) {
                    return res
                        .status(400)
                        .json({ message: 'Name and targetAmount are required' });
                }

                const result = await query(
                    `INSERT INTO savings (
            user_id, name, target_amount, current_amount, target_date, 
            auto_save, auto_save_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [
                        user.id,
                        name,
                        targetAmount,
                        currentAmount || 0,
                        targetDate || null,
                        autoSave || false,
                        autoSaveAmount || 0,
                    ]
                );

                return res.status(201).json(result.rows[0]);
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Savings API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
