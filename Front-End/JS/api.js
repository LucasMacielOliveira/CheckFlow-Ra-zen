const API_BASE_URL = "http://localhost:3000";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let mensagem = "Erro na requisição";

    try {
      const erro = await response.json();
      mensagem = erro?.erro || erro?.message || mensagem;
    } catch {
      // mantém mensagem padrão
    }

    throw new Error(mensagem);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

/* TAREFAS DO CHECKLIST */

async function buscarTarefas(processo, estado, filial) {
  const params = new URLSearchParams();

  if (processo) params.append("processo", processo);
  if (estado) params.append("estado", estado);
  if (filial) params.append("filial", filial);

  return request(`${API_BASE_URL}/tarefas?${params.toString()}`);
}

/* ESTADOS E FILIAIS */

async function buscarEstados() {
  return request(`${API_BASE_URL}/estados`);
}

async function buscarFiliaisPorEstado(estado) {
  const params = new URLSearchParams();

  if (estado) params.append("estado", estado);

  return request(`${API_BASE_URL}/filiais?${params.toString()}`);
}

/* HISTÓRICO */

async function buscarHistoricoAPI() {
  return request(`${API_BASE_URL}/historico`);
}

async function salvarHistoricoAPI(registro) {
  return request(`${API_BASE_URL}/historico`, {
    method: "POST",
    body: JSON.stringify(registro)
  });
}

async function excluirHistoricoAPI(id) {
  return request(`${API_BASE_URL}/historico/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

async function limparHistoricoAPI() {
  return request(`${API_BASE_URL}/historico`, {
    method: "DELETE"
  });
}

/* ADMIN - TAREFAS EXTRAS */

async function buscarTarefasAdmin() {
  return request(`${API_BASE_URL}/admin/tarefas`);
}

async function criarTarefaAPI(tarefa) {
  return request(`${API_BASE_URL}/admin/tarefas`, {
    method: "POST",
    body: JSON.stringify(tarefa)
  });
}

async function atualizarTarefaAPI(id, tarefa) {
  return request(`${API_BASE_URL}/admin/tarefas/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(tarefa)
  });
}

async function excluirTarefaAPI(id) {
  return request(`${API_BASE_URL}/admin/tarefas/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}