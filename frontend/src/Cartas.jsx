import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Cartas() {
  const [cartas, setCartas] = useState([]);
  const [pombos, setPombos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ conteudo: "", endereco: "", destinatario: "", remetente_id: "", pombo_id: "" });

  useEffect(() => {
    carregarCartas();
    axios.get("http://localhost:3001/pombos").then(res => setPombos(res.data));
    axios.get("http://localhost:3001/clientes").then(res => setClientes(res.data));
  }, []);

  function carregarCartas() { axios.get("http://localhost:3001/cartas").then(res => setCartas(res.data)); }

  function salvarCarta(e) {
    e.preventDefault();
    if (!form.conteudo || !form.endereco || !form.destinatario || !form.remetente_id || !form.pombo_id) {
      alert("Preencha todos os campos"); return;
    }

    axios.post("http://localhost:3001/cartas", form).then(() => {
      setForm({ conteudo: "", endereco: "", destinatario: "", remetente_id: "", pombo_id: "" });
      carregarCartas();
    });
  }

  function atualizarStatus(id, status) { axios.put(`http://localhost:3001/cartas/${id}/status`, { status }).then(() => carregarCartas()); }

  return (
    <div className="container">
      <h2>Cartas</h2>
      <form onSubmit={salvarCarta}>
        <input placeholder="Conteúdo" value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} required />
        <input placeholder="Endereço" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} required />
        <input placeholder="Destinatário" value={form.destinatario} onChange={e => setForm({ ...form, destinatario: e.target.value })} required />

        <select value={form.remetente_id} onChange={e => setForm({ ...form, remetente_id: e.target.value })} required>
          <option value="">Selecione o remetente</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>

        <select value={form.pombo_id} onChange={e => setForm({ ...form, pombo_id: e.target.value })} required>
          <option value="">Selecione o pombo</option>
          {pombos.filter(p => !p.aposentado).map(p => <option key={p.id} value={p.id}>{p.apelido}</option>)}
        </select>

        <button type="submit">Cadastrar</button>
      </form>

      {cartas.map(c => (
        <div key={c.id} className="card">
          <div className="card-header">
            <h3>{c.destinatario}</h3>
            <span className={`status ${c.status.replace(" ", "-")}`}>{c.status}</span>
          </div>
          <p>Conteúdo: {c.conteudo}</p>
          <p>Endereço: {c.endereco}</p>
          <p>Remetente: {c.remetente_nome || "—"}</p>
          <p>Pombo: {c.pombo_nome || "—"}</p>
          <div className="card-actions">
            <select value={c.status} onChange={e => atualizarStatus(c.id, e.target.value)} disabled={c.status === "entregue"}>
              <option value="na fila">na fila</option>
              <option value="enviado">enviado</option>
              <option value="entregue">entregue</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
