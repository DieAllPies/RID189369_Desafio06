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

  // Validate that at least one field is being updated
  if (nome === undefined && descricao === undefined && preco === undefined) {
    return res.status(400).json({ error: 'At least one field (nome, descricao, preco) must be provided' });
  }

  const fields = [];
  const params = [];

  if (nome !== undefined) {
    fields.push('nome = ?');
    params.push(nome);
  }

  if (descricao !== undefined) {
    fields.push('descricao = ?');
    params.push(descricao);
  }

  if (preco !== undefined) {
    const parsedPreco = parseFloat(preco);
    if (isNaN(parsedPreco)) {
      return res.status(400).json({ error: 'Invalid preco format' });
    }
    fields.push('preco = ?');
    params.push(parsedPreco);
  }

  params.push(id);

  const query = `UPDATE produtos SET ${fields.join(', ')} WHERE id = ?`;

  try {
    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ id, ...(nome && { nome }), ...(descricao && { descricao }), ...(preco && { preco }) });
  } catch (err) {
    console.error('Error updating product:', err);
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
