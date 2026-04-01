const API_BASE_URL = window.CHECKFLOW_API_URL || "http://localhost:3000"; //no ambiente local funciona com localhost:3000

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

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


//TAREFAS DO CHECKLIST


async function buscarTarefas(processo, estado, filial) {
  const params = new URLSearchParams();

  if (processo) params.append("processo", processo);
  if (estado) params.append("estado", estado);
  if (filial) params.append("filial", filial);

  return request(`/tarefas?${params.toString()}`);
}


// ESTADOS E FILIAIS

async function buscarEstados() { // LISTA DE ESTADOS PARA O FILTRO
  return request("/estados");
}

async function buscarFiliaisPorEstado(estado) { // filiais por estado para o filtro
  const params = new URLSearchParams();

  if (estado) {
    params.append("estado", estado);
  }

  return request(`/filiais?${params.toString()}`);
}

// HISTÓRICO DE TAREFAS

async function buscarHistoricoAPI() { // busca o histórico completo de tarefas, sem filtros
  return request("/historico");
}

async function salvarHistoricoAPI(registro) { // salva um novo registro no histórico de tarefas
  return request("/historico", {
    method: "POST",
    body: JSON.stringify(registro)
  });
}

async function excluirHistoricoAPI(id) { // exclui um registro específico do histórico de tarefas
  return request(`/historico/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

async function limparHistoricoAPI() { // limpa todo o histórico de tarefas
  return request("/historico", {
    method: "DELETE"
  });
}

//DMIN - TAREFAS EXTRAS

async function buscarTarefasAdmin() { // busca todas as tarefas extras criadas pelo admin, sem filtros
  return request("/admin/tarefas");
}

async function criarTarefaAPI(tarefa) { // cria uma nova tarefa extra no sistema, associada a um processo específico
  return request("/admin/tarefas", {
    method: "POST",
    body: JSON.stringify(tarefa)
  });
}

async function atualizarTarefaAPI(id, tarefa) { // atualiza os detalhes de uma tarefa extra existente, identificada por seu ID
  return request(`/admin/tarefas/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(tarefa)
  });
}

async function excluirTarefaAPI(id) { // exclui uma tarefa extra específica do sistema, identificada por seu ID
  return request(`/admin/tarefas/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}