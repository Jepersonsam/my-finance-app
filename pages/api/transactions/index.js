import { query, initDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
  const { method } = req;

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
        // Get query parameters for filtering
        const { startDate, endDate } = req.query;
        
        let queryText = 'SELECT * FROM transactions WHERE user_id = $1';
        const queryParams = [user.id];

        if (startDate && endDate) {
          queryText += ' AND date >= $2 AND date <= $3 ORDER BY date DESC, created_at DESC';
          queryParams.push(startDate, endDate);
        } else {
          queryText += ' ORDER BY date DESC, created_at DESC';
        }

        const result = await query(queryText, queryParams);
        return res.status(200).json(result.rows);
      }

      case 'POST': {
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

        const result = await query(
          'INSERT INTO transactions (user_id, type, category, amount, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [user.id, type, category, amount, description || null, date]
        );

        return res.status(201).json(result.rows[0]);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Transactions API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
