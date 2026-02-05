import { query, initDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    // Initialize database tables if they don't exist
    await initDatabase();

    // Get authenticated user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    switch (method) {
      case 'GET': {
        const result = await query(
          'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
          [id, user.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Transaction not found' });
        }

        return res.status(200).json(result.rows[0]);
      }

      case 'PUT': {
        const { type, category, amount, description, date } = req.body;

        // Validate input
        if (!type || !category || !amount || !date) {
          return res.status(400).json({ message: 'Type, category, amount, and date are required' });
        }

        if (type !== 'income' && type !== 'expense') {
          return res.status(400).json({ message: 'Type must be income or expense' });
        }

        if (amount <= 0) {
          return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // Check if transaction exists and belongs to user
        const checkResult = await query(
          'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
          [id, user.id]
        );

        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: 'Transaction not found' });
        }

        const result = await query(
          'UPDATE transactions SET type = $1, category = $2, amount = $3, description = $4, date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
          [type, category, amount, description || null, date, id, user.id]
        );

        return res.status(200).json(result.rows[0]);
      }

      case 'DELETE': {
        // Check if transaction exists and belongs to user
        const checkResult = await query(
          'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
          [id, user.id]
        );

        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: 'Transaction not found' });
        }

        await query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, user.id]);

        return res.status(200).json({ message: 'Transaction deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Transaction API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
