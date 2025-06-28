// src/routes/produtos.routes.js
const express = require('express');
const router = express.Router();

// Simulated in-memory data
const shared = require('./_sharedMemory');
const produtos = shared.produtos;
let nextId = 1;

// POST /produtos → create a new product
router.post('/', (req, res) => {
  const { nome, descricao, preco } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome and preco are required' });
  }

  const novoProduto = {
    id: nextId++,
    nome,
    descricao: descricao || '',
    preco: parseFloat(preco),
  };

  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
});
router.get('/', (req, res) => {
  res.json(produtos);
});
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find(p => p.id === id);

  if (!produto) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  res.json(produto);
});
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, descricao, preco } = req.body;

  const produto = produtos.find(p => p.id === id);
  if (!produto) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  if (nome) produto.nome = nome;
  if (descricao) produto.descricao = descricao;
  if (preco !== undefined) produto.preco = parseFloat(preco);

  res.json(produto);
});
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = produtos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const deletado = produtos.splice(index, 1);
  res.json({ message: 'Produto deletado com sucesso', produto: deletado[0] });
});
module.exports = router;
