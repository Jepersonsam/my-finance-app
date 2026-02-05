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
            'SELECT id FROM savings WHERE id = $1 AND user_id = $2',
            [id, user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Saving not found' });
        }

        switch (method) {
            case 'GET': {
                const result = await query(
                    'SELECT * FROM savings WHERE id = $1 AND user_id = $2',
                    [id, user.id]
                );
                return res.status(200).json(result.rows[0]);
            }

            case 'PUT': {
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
                    `UPDATE savings SET 
            name = $1, target_amount = $2, current_amount = $3, target_date = $4, 
            auto_save = $5, auto_save_amount = $6, updated_at = CURRENT_TIMESTAMP
          WHERE id = $7 AND user_id = $8 RETURNING *`,
                    [
                        name,
                        targetAmount,
                        currentAmount || 0,
                        targetDate || null,
                        autoSave || false,
                        autoSaveAmount || 0,
                        id,
                        user.id,
                    ]
                );

                return res.status(200).json(result.rows[0]);
            }

            case 'DELETE': {
                await query('DELETE FROM savings WHERE id = $1 AND user_id = $2', [
                    id,
                    user.id,
                ]);
                return res
                    .status(200)
                    .json({ message: 'Saving deleted successfully' });
            }

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Savings API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
