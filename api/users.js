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
          const users = await executeQuery('SELECT * FROM users WHERE id = ?', [id]);
          if (users.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
          }
          res.status(200).json(users[0]);
        } else {
          const users = await executeQuery('SELECT * FROM users');
          res.status(200).json(users);
        }
        break;

      case 'POST':
        const { username, password, role } = req.body;
        if (!username || !password) {
          res.status(400).json({ error: 'Username y password son requeridos' });
          return;
        }
        const result = await executeQuery(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          [username, password, role || 'user']
        );
        res.status(201).json({ id: result.insertId, username, password, role: role || 'user' });
        break;

      case 'PUT':
        if (!id) {
          res.status(400).json({ error: 'ID es requerido' });
          return;
        }
        const { username: putUsername, password: putPassword } = req.body;
        if (!putUsername || !putPassword) {
          res.status(400).json({ error: 'Username y password son requeridos' });
          return;
        }
        await executeQuery(
          'UPDATE users SET username = ?, password = ? WHERE id = ?',
          [putUsername, putPassword, id]
        );
        res.status(200).json({ message: 'Usuario actualizado' });
        break;

      case 'DELETE':
        if (!id) {
          res.status(400).json({ error: 'ID es requerido' });
          return;
        }
        await executeQuery('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'Usuario eliminado' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in users API:', error);
    res.status(500).json({ error: error.message });
  }
}
