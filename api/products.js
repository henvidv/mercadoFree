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
        if (id) {
          const products = await executeQuery('SELECT * FROM products WHERE id = ?', [id]);
          if (products.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
          }
          res.status(200).json(products[0]);
        } else {
          const products = await executeQuery('SELECT * FROM products');
          res.status(200).json(products);
        }
        break;

      case 'POST':
        const { title, price, description, image, sellerId, sellerName } = req.body;
        if (!title || !price || !description || !sellerId || !sellerName) {
          res.status(400).json({ error: 'Todos los campos son requeridos' });
          return;
        }
        const result = await executeQuery(
          'INSERT INTO products (title, price, description, image, seller_id, seller_name) VALUES (?, ?, ?, ?, ?, ?)',
          [title, price, description, image, sellerId, sellerName]
        );
        res.status(201).json({ id: result.insertId, title, price, description, image, sellerId, sellerName });
        break;

      case 'PUT':
        if (!id) {
          res.status(400).json({ error: 'ID es requerido' });
          return;
        }
        const { title: putTitle, price: putPrice, description: putDescription, image: putImage } = req.body;
        if (!putTitle || !putPrice || !putDescription) {
          res.status(400).json({ error: 'Title, price y description son requeridos' });
          return;
        }
        await executeQuery(
          'UPDATE products SET title = ?, price = ?, description = ?, image = ? WHERE id = ?',
          [putTitle, putPrice, putDescription, putImage, id]
        );
        res.status(200).json({ message: 'Producto actualizado' });
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ error: 'ID es requerido' });
          return;
        }
        await executeQuery('DELETE FROM products WHERE id = ?', [id]);
        res.status(200).json({ message: 'Producto eliminado' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({ error: error.message });
  }
}
