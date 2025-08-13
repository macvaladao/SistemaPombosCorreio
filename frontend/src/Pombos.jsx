import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Pombos() {
  const [pombos, setPombos] = useState([]);
  const [form, setForm] = useState({ apelido: "", velocidade_media: "", foto: "", aposentado: 0 });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => { carregarPombos(); }, []);

  function carregarPombos() {
    axios.get("http://localhost:3001/pombos").then(res => setPombos(res.data));
  }

  function salvarPombo(e) {
    e.preventDefault();
    const velocidade = parseFloat(form.velocidade_media) || 0;
    const request = editandoId
      ? axios.put(`http://localhost:3001/pombos/${editandoId}`, { ...form, velocidade_media: velocidade, aposentado: form.aposentado ? 1 : 0 })
      : axios.post("http://localhost:3001/pombos", { ...form, velocidade_media: velocidade });

    request.then(() => {
      setForm({ apelido: "", velocidade_media: "", foto: "", aposentado: 0 });
      setEditandoId(null);
      carregarPombos();
    });
  }

  function editarPombo(p) {
    setForm({ apelido: p.apelido, velocidade_media: p.velocidade_media, foto: p.foto, aposentado: p.aposentado === 1 });
    setEditandoId(p.id);
  }

  function cancelarEdicao() { setForm({ apelido: "", velocidade_media: "", foto: "", aposentado: 0 }); setEditandoId(null); }

  function deletarPombo(id) {
    if (window.confirm("Confirma a exclusão deste pombo?")) {
      axios.delete(`http://localhost:3001/pombos/${id}`)
        .then(() => carregarPombos())
        .catch(() => alert("Erro ao deletar o pombo, o mesmo possui cartas atreladas"));
    }
  }

  function aposentarPombo(id) {
    if (window.confirm("Deseja aposentar este pombo?")) {
      axios.patch(`http://localhost:3001/pombos/${id}/aposentar`)
        .then(() => carregarPombos())
        .catch(() => alert("Erro ao aposentar o pombo"));
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm({ ...form, foto: res.data.url });
    } catch {
      alert("Erro ao enviar a imagem");
    }
  }

  return (
    <div className="container">
      <h2>Pombos</h2>
      <form onSubmit={salvarPombo}>
        <input placeholder="Apelido" value={form.apelido} onChange={e => setForm({ ...form, apelido: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Velocidade Média" value={form.velocidade_media} onChange={e => setForm({ ...form, velocidade_media: e.target.value })} />
        <input type="file" accept="image/*" onChange={handleFotoChange} />
        {form.foto && <img src={form.foto} alt="Pombo" style={{ width: 100, marginTop: 10 }} />}

        {editandoId && (
          <label style={{ display: "block", marginTop: 10 }}>
            <input type="checkbox" checked={form.aposentado === 1 || form.aposentado === true} onChange={e => setForm({ ...form, aposentado: e.target.checked })} />
            {" "}Aposentado
          </label>
        )}

        <button type="submit">{editandoId ? "Atualizar" : "Cadastrar"}</button>
        {editandoId && <button type="button" onClick={cancelarEdicao} style={{ marginLeft: 10 }}>Cancelar</button>}
      </form>

      {pombos.map(p => (
        <div key={p.id} className="card">
          <div className="card-header">
            <h3>{p.apelido}</h3>
          </div>
          <p>Velocidade: {p.velocidade_media}</p>
          {p.foto && <img src={p.foto} alt="Pombo" style={{ width: 100 }} />}
          <p>Status: {p.aposentado === 1 ? "Aposentado" : "Ativo"}</p>
          <div className="card-actions">
            <button onClick={() => editarPombo(p)}>Editar</button>
            <button onClick={() => deletarPombo(p.id)} style={{ color: "red" }}>Deletar</button>
            {p.aposentado === 0 && <button onClick={() => aposentarPombo(p.id)} style={{ color: "orange" }}>Aposentar</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
