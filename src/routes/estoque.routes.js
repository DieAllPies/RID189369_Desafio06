const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /estoque → create stock entry for a product
router.post('/', async (req, res) => {
  const { id_produto, quantidade } = req.body;

  if (!id_produto || quantidade == null) {
    return res.status(400).json({ error: 'id_produto and quantidade are required' });
  }

  try {
    // Check if product exists
    const [productRows] = await db.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id_produto]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Produto não existe' });
    }

    // Check if stock already exists
    const [exists] = await db.execute(
      'SELECT * FROM estoque WHERE produto_id = ?',
      [id_produto]
    );

    if (exists.length > 0) {
      return res.status(409).json({ error: 'Estoque já cadastrado para esse produto' });
    }

    // Insert stock
    const [result] = await db.execute(
      'INSERT INTO estoque (produto_id, quantidade) VALUES (?, ?)',
      [id_produto, quantidade]
    );

    res.status(201).json({ id_estoque: result.insertId, id_produto, quantidade });
  } catch (err) {
    console.error('Erro ao inserir estoque:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// GET /estoque → list all stock
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM estoque');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /estoque/:id_produto → get stock for a specific product
router.get('/:id_produto', async (req, res) => {
  const id = parseInt(req.params.id_produto);

  try {
    const [rows] = await db.execute('SELECT * FROM estoque WHERE produto_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado no estoque' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /estoque/:id_produto → update stock quantity
router.put('/:id_produto', async (req, res) => {
  const id = parseInt(req.params.id_produto);
  const { quantidade } = req.body;

  if (quantidade == null) {
    return res.status(400).json({ error: 'Quantidade é obrigatória' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE estoque SET quantidade = ? WHERE produto_id = ?',
      [quantidade, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado no estoque' });
    }

    res.json({ id_produto: id, quantidade });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /estoque/:id_produto → remove stock entry
router.delete('/:id_produto', async (req, res) => {
  const id = parseInt(req.params.id_produto);

  try {
    const [result] = await db.execute(
      'DELETE FROM estoque WHERE produto_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado no estoque' });
    }

    res.json({ message: 'Estoque removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
