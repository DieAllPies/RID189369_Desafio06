// src/app.js
const express = require('express');
const morgan = require('morgan');
const app = express();

// Middlewares
app.use(express.json());           // Parse JSON request bodies
app.use(morgan('dev'));            // Log HTTP requests

// Routes
const produtosRoutes = require('./routes/produtos.routes');
app.use('/produtos', produtosRoutes);
const clientesRoutes = require('./routes/clientes.routes');
app.use('/clientes', clientesRoutes);
const estoqueRoutes = require('./routes/estoque.routes');
app.use('/estoque', estoqueRoutes);
const vendasRoutes = require('./routes/vendas.routes');
app.use('/vendas', vendasRoutes);


// Optional: 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
