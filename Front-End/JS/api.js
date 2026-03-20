const API_BASE_URL = "http://localhost:3000";

async function buscarEstados() {
  const response = await fetch(`${API_BASE_URL}/estados`);

  if (!response.ok) {
    throw new Error("Erro ao buscar estados");
  }

  return await response.json();
}

async function buscarFiliaisPorEstado(estado) {
  const response = await fetch(
    `${API_BASE_URL}/filiais?estado=${encodeURIComponent(estado)}`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar filiais");
  }

  return await response.json();
}

async function buscarTarefas(processo, estado, filial) {
  let url = `${API_BASE_URL}/tarefas?processo=${encodeURIComponent(processo)}`;

  if (estado) {
    url += `&estado=${encodeURIComponent(estado)}`;
  }

  if (filial) {
    url += `&filial=${encodeURIComponent(filial)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Erro ao buscar tarefas");
  }

  return await response.json();
}

async function buscarHistoricoAPI() {
  const response = await fetch(`${API_BASE_URL}/historico`);

  if (!response.ok) {
    throw new Error("Erro ao buscar histórico");
  }

  return await response.json();
}

async function salvarHistoricoAPI(registro) {
  const response = await fetch(`${API_BASE_URL}/historico`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(registro)
  });

  if (!response.ok) {
    throw new Error("Erro ao salvar histórico");
  }

  return await response.json();
}

async function excluirHistoricoAPI(id) {
  const response = await fetch(`${API_BASE_URL}/historico/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir histórico");
  }

  return await response.json();
}

async function limparHistoricoAPI() {
  const response = await fetch(`${API_BASE_URL}/historico`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Erro ao limpar histórico");
  }

  return await response.json();
}