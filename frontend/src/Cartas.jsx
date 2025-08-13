import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Cartas() {
  const [cartas, setCartas] = useState([]);
  const [pombos, setPombos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ conteudo: "", endereco: "", destinatario: "", remetente_id: "", pombo_id: "" });
  const [abertas, setAbertas] = useState({}); // controla quais cartas estão abertas

  useEffect(() => {
    carregarCartas();
    axios.get("http://localhost:3001/pombos").then(res => setPombos(res.data));
    axios.get("http://localhost:3001/clientes").then(res => setClientes(res.data));
  }, []);

  function carregarCartas() {
    axios.get("http://localhost:3001/cartas").then(res => setCartas(res.data));
  }

  function salvarCarta(e) {
    e.preventDefault();
    if (!form.conteudo || !form.endereco || !form.destinatario || !form.remetente_id || !form.pombo_id) {
      alert("Preencha todos os campos");
      return;
    }

    axios.post("http://localhost:3001/cartas", form).then(() => {
      setForm({ conteudo: "", endereco: "", destinatario: "", remetente_id: "", pombo_id: "" });
      carregarCartas();
    });
  }

  function atualizarStatus(id, status) {
    axios.put(`http://localhost:3001/cartas/${id}/status`, { status }).then(() => carregarCartas());
  }

  function toggleCarta(id) {
    setAbertas(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="container">
      <h2>Cartas</h2>
      <form
        onSubmit={salvarCarta}
        style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "4px" }}>Conteúdo:</label>
          <textarea
            placeholder="Conteúdo"
            value={form.conteudo}
            onChange={e => setForm({ ...form, conteudo: e.target.value })}
            required
            rows={4}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px" }}>Endereço:</label>
          <input
            placeholder="Endereço"
            value={form.endereco}
            onChange={e => setForm({ ...form, endereco: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px" }}>Destinatário:</label>
          <input
            placeholder="Destinatário"
            value={form.destinatario}
            onChange={e => setForm({ ...form, destinatario: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", gap: "30px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Remetente:</label>
            <select
              value={form.remetente_id}
              onChange={e => setForm({ ...form, remetente_id: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Selecione o remetente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Pombo:</label>
            <select
              value={form.pombo_id}
              onChange={e => setForm({ ...form, pombo_id: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Selecione o pombo</option>
              {pombos.filter(p => !p.aposentado).map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          style={{ padding: "10px 16px", borderRadius: "4px", backgroundColor: "#4CAF50", color: "white", border: "none", marginTop: "10px" }}
        >
          Cadastrar
        </button>
      </form>

      {cartas.map(c => (
        <div key={c.id} className="card" style={{ marginTop: "12px", border: "1px solid #ccc", borderRadius: "4px" }}>
          <div
            className="card-header"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: "8px" }}
            onClick={() => toggleCarta(c.id)}
          >
            <div>
              <h3>{c.destinatario}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`status ${c.status.replace(" ", "-")}`}>{c.status}</span>
                <select
                  value={c.status}
                  onChange={e => atualizarStatus(c.id, e.target.value)}
                  disabled={c.status === "entregue"}
                  onClick={e => e.stopPropagation()}
                >
                  <option value="na fila">na fila</option>
                  <option value="enviado">enviado</option>
                  <option value="entregue">entregue</option>
                </select>
              </div>
            </div>
            <span>{abertas[c.id] ? "▲" : "▼"}</span>
          </div>

          {abertas[c.id] && (
            <div className="card-body" style={{ padding: "8px", borderTop: "1px solid #ccc" }}>
              <p>Conteúdo: {c.conteudo}</p>
              <p>Endereço: {c.endereco}</p>
              <p>Remetente: {c.remetente_nome || "—"}</p>
              <p>Pombo: {c.pombo_nome || "—"}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
