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
            'SELECT id FROM installments WHERE id = $1 AND user_id = $2',
            [id, user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Installment not found' });
        }

        switch (method) {
            case 'GET': {
                const result = await query(
                    'SELECT * FROM installments WHERE id = $1 AND user_id = $2',
                    [id, user.id]
                );
                return res.status(200).json(result.rows[0]);
            }

            case 'PUT': {
                const {
                    name,
                    totalAmount,
                    paidAmount,
                    installments,
                    currentInstallment,
                    dueDate,
                    reminder,
                } = req.body;

                if (!name || !totalAmount || !installments || !dueDate) {
                    return res.status(400).json({
                        message:
                            'Name, totalAmount, installments, and dueDate are required',
                    });
                }

                const result = await query(
                    `UPDATE installments SET 
            name = $1, total_amount = $2, paid_amount = $3, installments = $4,
            current_installment = $5, due_date = $6, reminder = $7,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8 AND user_id = $9 RETURNING *`,
                    [
                        name,
                        totalAmount,
                        paidAmount || 0,
                        installments,
                        currentInstallment || 0,
                        dueDate,
                        reminder ?? true,
                        id,
                        user.id,
                    ]
                );

                return res.status(200).json(result.rows[0]);
            }

            case 'DELETE': {
                await query('DELETE FROM installments WHERE id = $1 AND user_id = $2', [
                    id,
                    user.id,
                ]);
                return res
                    .status(200)
                    .json({ message: 'Installment deleted successfully' });
            }

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Installments API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
