const express = require('express');
const router = express.Router();

const shared = require('./_sharedMemory');
const estoque = shared.estoque;
let nextId = 1; // for simulation purposes only, unused in real stock

// POST /estoque → set stock for a product
router.post('/', (req, res) => {
  const { id_produto, quantidade } = req.body;

  if (!id_produto || quantidade == null) {
    return res.status(400).json({ error: 'id_produto and quantidade are required' });
  }

  const existente = estoque.find(e => e.id_produto === id_produto);
  if (existente) {
    return res.status(409).json({ error: 'Estoque já cadastrado para esse produto' });
  }

  estoque.push({ id_produto, quantidade });
  res.status(201).json({ id_produto, quantidade });
});

// GET /estoque → list full stock
router.get('/', (req, res) => {
  res.json(estoque);
});

// GET /estoque/:id_produto → get stock for a product
router.get('/:id_produto', (req, res) => {
  const id = parseInt(req.params.id_produto);
  const item = estoque.find(e => e.id_produto === id);

  if (!item) {
    return res.status(404).json({ error: 'Produto não encontrado no estoque' });
  }

  res.json(item);
});

// PUT /estoque/:id_produto → update stock quantity
router.put('/:id_produto', (req, res) => {
  const id = parseInt(req.params.id_produto);
  const { quantidade } = req.body;

  const item = estoque.find(e => e.id_produto === id);
  if (!item) {
    return res.status(404).json({ error: 'Produto não encontrado no estoque' });
  }

  if (quantidade == null) {
    return res.status(400).json({ error: 'Quantidade é obrigatória' });
  }

  item.quantidade = quantidade;
  res.json(item);
});
router.delete('/:id_produto', (req, res) => {
  const id = parseInt(req.params.id_produto);
  const index = estoque.findIndex(e => e.id_produto === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado no estoque' });
  }

  const removido = estoque.splice(index, 1);
  res.json({ message: 'Estoque removido com sucesso', estoque: removido[0] });
});

module.exports = router;
