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
  const productId = query.productId;

  try {
    switch (method) {
      case 'GET':
        if (productId) {
          const reviews = await executeQuery('SELECT * FROM reviews WHERE product_id = ?', [productId]);
          res.status(200).json(reviews);
        } else {
          const reviews = await executeQuery('SELECT * FROM reviews');
          res.status(200).json(reviews);
        }
        break;

      case 'POST':
        const { productId: postProductId, author, text, rating } = req.body;
        if (!postProductId || !author || !text || !rating) {
          res.status(400).json({ error: 'Todos los campos son requeridos' });
          return;
        }
        const result = await executeQuery(
          'INSERT INTO reviews (product_id, author, text, rating) VALUES (?, ?, ?, ?)',
          [postProductId, author, text, rating]
        );
        res.status(201).json({ id: result.insertId, productId: postProductId, author, text, rating });
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ error: 'ID es requerido' });
          return;
        }
        await executeQuery('DELETE FROM reviews WHERE id = ?', [id]);
        res.status(200).json({ message: 'Reseña eliminada' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in reviews API:', error);
    res.status(500).json({ error: error.message });
  }
}
