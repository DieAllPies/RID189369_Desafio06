## DNC Challenge
- A Node.js REST API for managing products, clients, stock, and sales for an online cosmetics store, built with in-memory data and designed to simulate a real backend system.
- Techs: Node.js using Express.

## Requirements
### 1. Data modeling quality
- Entities: `produtos`, `clientes`, `estoque`, `vendas`, `venda_produto`
- Relationships and attributes clearly defined (e.g. `cliente_id`, `data`, `quantidade`)
- See ERD below.

### 2. Naming clarity
- Tables and fields named clearly and consistently (e.g. `nome`, `preco`, `id_produto`)

### 3. RESTful API
- Endpoints follow REST conventions:
  - `POST /produtos`
  - `GET /clientes/:id`
  - `POST /vendas`
  - `POST /pedidos` (same logic as `vendas`)
  - `PUT /estoque/:id_produto`

### 4. API responses
- Proper status codes:
  - `201 Created`, `200 OK`, `404 Not Found`, `400 Bad Request`, `409 Conflict`
- JSON responses for all resources

---

## 🧩 Database Schema (ERD)
![Untitled](https://github.com/user-attachments/assets/ce241888-ef54-48c7-a8cf-33bca3abab5f)


## Requirements
- Node.js
- Docker 
- .env file (based on `.env.example`)
- Postman
- MySQL

## How to Run

After installing the requirements and setting up your `.env` file, run:

```bash
npm run start:dev