const API_BASE_URL = "http://localhost:3000";

async function buscarEstados() {
  const resposta = await fetch(`${API_BASE_URL}/estados`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar estados");
  }

  return await resposta.json();
}

async function buscarFiliaisPorEstado(estado) {
  const resposta = await fetch(
    `${API_BASE_URL}/filiais?estado=${encodeURIComponent(estado)}`
  );

  if (!resposta.ok) {
    throw new Error("Erro ao buscar filiais");
  }

  return await resposta.json();
}