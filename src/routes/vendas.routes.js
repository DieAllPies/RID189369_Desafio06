const express = require('express');
const router = express.Router();

let nextId = 1;


// But for now we’ll just simulate them in this file:
const shared = require('./_sharedMemory');
const { clientes, produtos, estoque, vendas } = shared;
const cliente = clientes.find(c => c.id === cliente_id);


// POST /vendas → create a new sale
router.post('/', (req, res) => {
  const { cliente_id, itens } = req.body;

  if (!cliente_id || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'cliente_id and at least one item are required' });
  }

  const cliente = shared.clientes.find(c => c.id === cliente_id);
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const vendaItens = [];

  for (let item of itens) {
    const { id_produto, quantidade } = item;
    const produto = shared.produtos.find(p => p.id === id_produto);
    const estoqueItem = shared.estoque.find(e => e.id_produto === id_produto);

    if (!produto) {
      return res.status(404).json({ error: `Produto ${id_produto} não encontrado` });
    }

    if (!estoqueItem || estoqueItem.quantidade < quantidade) {
      return res.status(400).json({ error: `Estoque insuficiente para o produto ${id_produto}` });
    }

    // Decrease stock
    estoqueItem.quantidade -= quantidade;

    vendaItens.push({ id_produto, quantidade });
  }

  const novaVenda = {
    id: nextId++,
    cliente_id,
    data: new Date().toISOString(),
    itens: vendaItens
  };

  vendas.push(novaVenda);
  res.status(201).json(novaVenda);
});

// GET /vendas → list all
router.get('/', (req, res) => {
  res.json(vendas);
});

module.exports = router;
