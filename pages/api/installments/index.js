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
                    'SELECT * FROM installments WHERE user_id = $1 ORDER BY created_at DESC',
                    [user.id]
                );
                return res.status(200).json(result.rows);
            }

            case 'POST': {
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
                    `INSERT INTO installments (
            user_id, name, total_amount, paid_amount, installments,
            current_installment, due_date, reminder
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                    [
                        user.id,
                        name,
                        totalAmount,
                        paidAmount || 0,
                        installments,
                        currentInstallment || 0,
                        dueDate,
                        reminder ?? true,
                    ]
                );

                return res.status(201).json(result.rows[0]);
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Installments API error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
