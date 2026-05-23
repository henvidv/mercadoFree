const { executeQuery } = require('./db');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query } = req;
  const id = query.id;

  try {
    switch (method) {
      case 'GET':
        const cards = await executeQuery('SELECT * FROM cards');
        res.status(200).json(cards);
        break;

      case 'POST':
        const { number, last4, name, expiry, cvv, userId } = req.body;
        if (!number || !last4 || !name || !expiry || !cvv || !userId) {
          res.status(400).json({ error: 'Todos los campos son requeridos' });
          return;
        }
        const result = await executeQuery(
          'INSERT INTO cards (number, last4, name, expiry, cvv, user_id) VALUES (?, ?, ?, ?, ?, ?)',
          [number, last4, name, expiry, cvv, userId]
        );
        res.status(201).json({ id: result.insertId, number, last4, name, expiry, cvv, userId });
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ error: 'ID es requerido' });
          return;
        }
        await executeQuery('DELETE FROM cards WHERE id = ?', [id]);
        res.status(200).json({ message: 'Tarjeta eliminada' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in cards API:', error);
    res.status(500).json({ error: error.message });
  }
}
