const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /vendas → create a new sale
router.post('/', async (req, res) => {
  const { cliente_id, itens } = req.body;

  if (!cliente_id || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'cliente_id and at least one item are required' });
  }

  const connection = await db.getConnection(); // Transactional safety
  try {
    await connection.beginTransaction();

    // 1. Check if the client exists
    const [clienteRows] = await connection.execute(
      'SELECT * FROM clientes WHERE id = ?',
      [cliente_id]
    );
    if (clienteRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // 2. Check stock for each product
    for (const item of itens) {
      const [estoqueRows] = await connection.execute(
        'SELECT * FROM estoque WHERE produto_id = ?',
        [item.id_produto]
      );

      if (
        estoqueRows.length === 0 ||
        estoqueRows[0].quantidade < item.quantidade
      ) {
        await connection.rollback();
        return res.status(400).json({
          error: `Estoque insuficiente para o produto ${item.id_produto}`,
        });
      }
    }

    // 3. Create the sale
    const [vendaResult] = await connection.execute(
      'INSERT INTO vendas (cliente_id) VALUES (?)',
      [cliente_id]
    );
    const venda_id = vendaResult.insertId;

    // 4. Insert items into venda_produto and update stock
    for (const item of itens) {
      await connection.execute(
        'INSERT INTO venda_produto (venda_id, produto_id, quantidade) VALUES (?, ?, ?)',
        [venda_id, item.id_produto, item.quantidade]
      );

      await connection.execute(
        'UPDATE estoque SET quantidade = quantidade - ? WHERE produto_id = ?',
        [item.quantidade, item.id_produto]
      );
    }

    await connection.commit();

    res.status(201).json({
      id: venda_id,
      cliente_id,
      data: new Date().toISOString(),
      itens
    });
  } catch (err) {
    await connection.rollback();
    console.error('Erro ao registrar venda:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release();
  }
});

// GET /vendas → list all sales
router.get('/', async (req, res) => {
  try {
    const [vendas] = await db.execute(`
      SELECT v.id, v.cliente_id, c.nome AS cliente_nome, v.data_venda
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.id DESC
    `);

    const fullVendas = [];

    for (const venda of vendas) {
      const [itens] = await db.execute(
        'SELECT produto_id, quantidade FROM venda_produto WHERE venda_id = ?',
        [venda.id]
      );

      fullVendas.push({
        ...venda,
        itens
      });
    }

    res.json(fullVendas);
  } catch (err) {
    console.error('Erro ao buscar vendas:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
