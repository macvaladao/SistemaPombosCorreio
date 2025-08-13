# Sistema de Pombos Correio 🕊️

Aplicação web para gerenciar **clientes**, **pombos** e **cartas** em um sistema de entrega fictício.  
Frontend em **React.js** e backend em **Node.js** com **Express** e **SQLite**.

---

## 🛠 Tecnologias

- **Frontend:** React.js, Axios  
- **Backend:** Node.js, Express, better-sqlite3  
- **Banco de dados:** SQLite

---

## 🚀 Como rodar o projeto

### 1. Rodar o backend
No terminal

cd backend
npm install
node server.js

O servidor vai rodar em http://localhost:3001.

### 2. Rodar o frontend
Em outro terminal:

cd frontend
npm install
npm start

O frontend vai abrir em http://localhost:3000.

---

## 📋 Funcionalidades

### Clientes

Cadastrar, editar e excluir clientes

Validação de campos obrigatórios

Impede exclusão de clientes que possuem cartas vinculadas

### Pombos

Cadastrar, editar, aposentar e excluir pombos

Pombos aposentados não aparecem na seleção para novas cartas

Checkbox para marcar pombo como aposentado

### Cartas

Cadastrar cartas vinculando cliente remetente e pombo

Atualizar status das cartas: na fila → enviado → entregue

Exibe remetente e pombo relacionados

Status de entrega impede alterações quando já entregue

---

