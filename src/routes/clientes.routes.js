const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /clientes → create a new client
router.post('/', async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome and email are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO clientes (nome, email) VALUES (?, ?)',
      [nome, email]
    );

    res.status(201).json({ id: result.insertId, nome, email });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

// GET /clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM clientes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /clientes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute('SELECT * FROM clientes WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /clientes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  // If neither field is provided, reject the request
  if (!nome && !email) {
    return res.status(400).json({ error: 'At least one of nome or email must be provided' });
  }

  // Dynamically build the query and params
  const fields = [];
  const params = [];

  if (nome) {
    fields.push('nome = ?');
    params.push(nome);
  }

  if (email) {
    fields.push('email = ?');
    params.push(email);
  }

  params.push(id); // for the WHERE clause

  const query = `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`;

  try {
    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ id, ...(nome && { nome }), ...(email && { email }) });
  } catch (err) {
    console.error('Error updating client:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});



// DELETE /clientes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM clientes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
