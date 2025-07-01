const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /produtos → create a new product
router.post('/', async (req, res) => {
  const { nome, descricao, preco } = req.body;

  if (!nome || preco == null) {
    return res.status(400).json({ error: 'Nome and preco are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)',
      [nome, descricao || '', parseFloat(preco)]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      descricao: descricao || '',
      preco: parseFloat(preco)
    });
  } catch (err) {
    console.error('Error inserting product:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /produtos → list all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM produtos');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /produtos/:id → get product by ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const [rows] = await db.execute('SELECT * FROM produtos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /produtos/:id → update a product
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, descricao, preco } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?',
      [nome, descricao, parseFloat(preco), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ id, nome, descricao, preco });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /produtos/:id → remove a product
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const [result] = await db.execute('DELETE FROM produtos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
