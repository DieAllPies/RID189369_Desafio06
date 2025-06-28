const express = require('express');
const router = express.Router();

// In-memory client storage
const shared = require('./_sharedMemory');
const clientes = shared.clientes;
let nextId = 1;

// POST /clientes → create a new client
router.post('/', (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome and email are required' });
  }

  const novoCliente = {
    id: nextId++,
    nome,
    email,
  };

  clientes.push(novoCliente);
  res.status(201).json(novoCliente);
});

// GET /clientes → list all clients
router.get('/', (req, res) => {
  res.json(clientes);
});

// GET /clientes/:id → get client by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = clientes.find(c => c.id === id);

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  res.json(cliente);
});

// PUT /clientes/:id → update a client
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email } = req.body;

  const cliente = clientes.find(c => c.id === id);
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  if (nome) cliente.nome = nome;
  if (email) cliente.email = email;

  res.json(cliente);
});

// DELETE /clientes/:id → remove a client
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = clientes.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const deletado = clientes.splice(index, 1);
  res.json({ message: 'Cliente deletado com sucesso', cliente: deletado[0] });
});

module.exports = router;
