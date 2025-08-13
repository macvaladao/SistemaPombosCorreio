const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());


const db = new Database("database.db");


db.prepare(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    nascimento TEXT,
    endereco TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS pombos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apelido TEXT,
    velocidade_media REAL,
    foto TEXT,
    aposentado BOOLEAN DEFAULT 0
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS cartas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conteudo TEXT,
    endereco TEXT,
    destinatario TEXT,
    remetente_id INTEGER,
    pombo_id INTEGER,
    status TEXT DEFAULT 'na fila',
    FOREIGN KEY(remetente_id) REFERENCES clientes(id),
    FOREIGN KEY(pombo_id) REFERENCES pombos(id)
)`).run();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");


app.post("/upload", upload.single("foto"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Arquivo não enviado" });
  res.json({ url: `http://localhost:3001/uploads/${req.file.filename}` });
});


app.use("/uploads", express.static("uploads"));


app.get("/clientes", (req, res) => {
  const clientes = db.prepare("SELECT * FROM clientes").all();
  res.json(clientes);
});

app.post("/clientes", (req, res) => {
  const { nome, email, nascimento, endereco } = req.body;
  db.prepare("INSERT INTO clientes (nome, email, nascimento, endereco) VALUES (?, ?, ?, ?)")
    .run(nome, email, nascimento, endereco);
  res.json({ message: "Cliente cadastrado com sucesso" });
});

app.put("/clientes/:id", (req, res) => {
  const { nome, email, nascimento, endereco } = req.body;
  db.prepare("UPDATE clientes SET nome=?, email=?, nascimento=?, endereco=? WHERE id=?")
    .run(nome, email, nascimento, endereco, req.params.id);
  res.json({ message: "Cliente atualizado com sucesso" });
});

app.delete("/clientes/:id", (req, res) => {
  const cartas = db.prepare("SELECT * FROM cartas WHERE remetente_id=?").all(req.params.id);
  if (cartas.length) return res.status(400).json({ message: "Cliente possui cartas atreladas" });
  db.prepare("DELETE FROM clientes WHERE id=?").run(req.params.id);
  res.json({ message: "Cliente deletado" });
});


app.get("/pombos", (req, res) => {
  const pombos = db.prepare("SELECT * FROM pombos").all();
  res.json(pombos);
});

app.post("/pombos", (req, res) => {
  const { apelido, velocidade_media, foto } = req.body;
  db.prepare("INSERT INTO pombos (apelido, velocidade_media, foto, aposentado) VALUES (?, ?, ?, 0)")
    .run(apelido, velocidade_media, foto);
  res.sendStatus(201);
});

app.put("/pombos/:id", (req, res) => {
  const { apelido, velocidade_media, foto, aposentado } = req.body;
  db.prepare("UPDATE pombos SET apelido=?, velocidade_media=?, foto=?, aposentado=? WHERE id=?")
    .run(apelido, velocidade_media, foto, aposentado, req.params.id);
  res.json({ message: "Pombo atualizado com sucesso" });
});

app.delete("/pombos/:id", (req, res) => {
  const cartas = db.prepare("SELECT * FROM cartas WHERE pombo_id=?").all(req.params.id);
  if (cartas.length) return res.status(400).json({ message: "Pombo possui cartas atreladas" });
  db.prepare("DELETE FROM pombos WHERE id=?").run(req.params.id);
  res.json({ message: "Pombo deletado" });
});


app.patch("/pombos/:id/aposentar", (req, res) => {
  db.prepare("UPDATE pombos SET aposentado=1 WHERE id=?").run(req.params.id);
  res.json({ message: "Pombo aposentado" });
});


app.get("/cartas", (req, res) => {
  const cartas = db.prepare(`
    SELECT cartas.*, 
           pombos.apelido AS pombo_nome, 
           clientes.nome AS remetente_nome
    FROM cartas
    LEFT JOIN pombos ON cartas.pombo_id = pombos.id
    LEFT JOIN clientes ON cartas.remetente_id = clientes.id
  `).all();
  res.json(cartas);
});

app.post("/cartas", (req, res) => {
  const { conteudo, endereco, destinatario, remetente_id, pombo_id } = req.body;
  const remetenteExiste = db.prepare("SELECT id FROM clientes WHERE id=?").get(remetente_id);
  if (!remetenteExiste) return res.status(400).json({ error: "Remetente inválido" });
  db.prepare("INSERT INTO cartas (conteudo, endereco, destinatario, remetente_id, pombo_id) VALUES (?, ?, ?, ?, ?)")
    .run(conteudo, endereco, destinatario, remetente_id, pombo_id);
  res.json({ message: "Carta cadastrada com sucesso!" });
});

app.put("/cartas/:id/status", (req, res) => {
  const { status } = req.body;
  const carta = db.prepare("SELECT * FROM cartas WHERE id=?").get(req.params.id);
  if (!carta) return res.status(404).json({ error: "Carta não encontrada" });
  if (carta.status === "entregue") return res.status(400).json({ error: "Carta já entregue" });
  db.prepare("UPDATE cartas SET status=? WHERE id=?").run(status, req.params.id);
  res.json({ message: "Status atualizado!" });
});

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));
