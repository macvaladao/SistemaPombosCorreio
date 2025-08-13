import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: "", email: "", nascimento: "", endereco: "" });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => { carregarClientes(); }, []);

  function carregarClientes() { axios.get("http://localhost:3001/clientes").then(res => setClientes(res.data)); }

  function salvarCliente(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.nascimento.trim() || !form.endereco.trim()) {
      alert("Por favor, preencha todos os campos antes de salvar."); return;
    }

    const request = editandoId
      ? axios.put(`http://localhost:3001/clientes/${editandoId}`, form)
      : axios.post("http://localhost:3001/clientes", form);

    request.then(() => {
      setForm({ nome: "", email: "", nascimento: "", endereco: "" });
      setEditandoId(null);
      carregarClientes();
    });
  }

  function editarCliente(c) { setForm({ nome: c.nome, email: c.email, nascimento: c.nascimento, endereco: c.endereco }); setEditandoId(c.id); }
  function cancelarEdicao() { setForm({ nome: "", email: "", nascimento: "", endereco: "" }); setEditandoId(null); }

  function deletarCliente(id, nome) {
    if (window.confirm(`Confirma a exclusão do cliente ${nome}?`)) {
      axios.delete(`http://localhost:3001/clientes/${id}`)
        .then(() => carregarClientes())
        .catch(() => alert("Erro ao deletar o cliente, o mesmo possui cartas atreladas a ele"));
    }
  }

  return (
    <div className="container">
      <h2>Clientes</h2>
      <form onSubmit={salvarCliente}>
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" required />
        <input placeholder="Nascimento" value={form.nascimento} onChange={e => setForm({ ...form, nascimento: e.target.value })} type="date" required />
        <input placeholder="Endereço" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} required />
        <button type="submit">{editandoId ? "Atualizar" : "Cadastrar"}</button>
        {editandoId && <button type="button" onClick={cancelarEdicao} style={{ marginLeft: 10 }}>Cancelar</button>}
      </form>

      {clientes.map(c => (
        <div key={c.id} className="card">
          <div className="card-header">
            <h3>{c.nome}</h3>
            <span>{c.email}</span>
          </div>
          <p>Nascimento: {c.nascimento.split("-").reverse().join("/")}</p>
          <p>Endereço: {c.endereco}</p>
          <div className="card-actions">
            <button onClick={() => editarCliente(c)}>Editar</button>
            <button onClick={() => deletarCliente(c.id, c.nome)} style={{ color: "red" }}>Deletar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
