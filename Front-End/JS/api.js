const API_BASE_URL = window.CHECKFLOW_API_URL || "http://localhost:3000";

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

/* TAREFAS DO CHECKLIST */

async function buscarTarefas(processo, estado, filial) {
  const params = new URLSearchParams();

  if (processo) params.append("processo", processo);
  if (estado) params.append("estado", estado);
  if (filial) params.append("filial", filial);

  return request(`/tarefas?${params.toString()}`);
}

/* ESTADOS E FILIAIS */

async function buscarEstados() {
  return request("/estados");
}

async function buscarFiliaisPorEstado(estado) {
  const params = new URLSearchParams();

  if (estado) params.append("estado", estado);

  return request(`/filiais?${params.toString()}`);
}

/* HISTÓRICO */

async function buscarHistoricoAPI(usuario = "") {
  const params = new URLSearchParams();

  if (usuario) {
    params.append("usuario", usuario);
  }

  const sufixo = params.toString() ? `?${params.toString()}` : "";
  return request(`/historico${sufixo}`);
}

async function salvarHistoricoAPI(registro) {
  return request("/historico", {
    method: "POST",
    body: JSON.stringify(registro)
  });
}

async function excluirHistoricoAPI(id) {
  return request(`/historico/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

async function limparHistoricoAPI() {
  return request("/historico", {
    method: "DELETE"
  });
}

/* ADMIN - TAREFAS EXTRAS */

async function buscarTarefasAdmin() {
  return request("/admin/tarefas");
}

async function criarTarefaAPI(tarefa) {
  return request("/admin/tarefas", {
    method: "POST",
    body: JSON.stringify(tarefa)
  });
}

async function atualizarTarefaAPI(id, tarefa) {
  return request(`/admin/tarefas/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(tarefa)
  });
}

async function excluirTarefaAPI(id) {
  return request(`/admin/tarefas/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

/* SOLICITAÇÕES */

async function buscarSolicitacoesAPI(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.status) params.append("status", filtros.status);
  if (filtros.criadoPor) params.append("criadoPor", filtros.criadoPor);

  const sufixo = params.toString() ? `?${params.toString()}` : "";
  return request(`/solicitacoes${sufixo}`);
}

async function criarSolicitacaoAPI(payload) {
  return request("/solicitacoes", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function atualizarStatusSolicitacaoAPI(id, status) {
  return request(`/solicitacoes/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}