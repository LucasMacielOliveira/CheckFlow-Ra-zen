function formatarData(data) {
  if (!data) return "-";

  return new Date(data).toLocaleString("pt-BR");
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setTexto(id, valor) {
  const elemento = document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }
}

function atualizarResumoAuditoria(logs) {
  const total = Array.isArray(logs) ? logs.length : 0;
  const ultimo = total > 0 ? logs[0] : null;

  setTexto("totalLogsAuditoria", total);
  setTexto("ultimaAcaoAuditoria", ultimo?.acao || "-");
  setTexto("ultimoUsuarioAuditoria", ultimo?.usuario_nome || ultimo?.usuarioNome || "-");
  setTexto("ultimaEntidadeAuditoria", ultimo?.entidade || "-");
}

async function carregarAuditoria() {
  const loading = document.getElementById("loadingAuditoria");
  const tabela = document.getElementById("auditoriaTabela");

  try {
    if (loading) loading.style.display = "flex";

    const query = montarQueryAuditoria();
    const logs = await request(`/admin/auditoria${query}`);

    atualizarResumoAuditoria(logs);

    tabela.innerHTML = "";

    if (!Array.isArray(logs) || !logs.length) {
      tabela.innerHTML = `
        <tr>
          <td colspan="5">Nenhum log encontrado.</td>
        </tr>
      `;
      return;
    }

    logs.forEach((log) => {
      tabela.innerHTML += `
        <tr>
          <td>${formatarData(log.criado_em || log.criadoEm)}</td>
          <td>${escaparHtml(log.usuario_nome || log.usuarioNome || "-")}</td>
          <td>${escaparHtml(log.acao || "-")}</td>
          <td>${escaparHtml(log.entidade || "-")}</td>
          <td>${escaparHtml(log.detalhes || "-")}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error(error);

    if (tabela) {
      tabela.innerHTML = `
        <tr>
          <td colspan="5">Erro ao carregar auditoria.</td>
        </tr>
      `;
    }

    alert(error.message || "Erro ao carregar auditoria.");
  } finally {
    if (loading) loading.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin()) return;

  const perfil = lerTexto("perfilUsuario");

  if (perfil !== "admin") {
    alert("Acesso restrito a administradores.");
    window.location.href = "processo.html";
    return;
  }

  

  carregarAuditoria();
});

function montarQueryAuditoria() {
  const usuario = document.getElementById("filtroUsuarioAuditoria")?.value.trim() || "";
  const acao = document.getElementById("filtroAcaoAuditoria")?.value || "";
  const dataInicio = document.getElementById("filtroDataInicioAuditoria")?.value || "";
  const dataFim = document.getElementById("filtroDataFimAuditoria")?.value || "";

  const params = new URLSearchParams();

  if (usuario) params.append("usuario", usuario);
  if (acao) params.append("acao", acao);
  if (dataInicio) params.append("dataInicio", dataInicio);
  if (dataFim) params.append("dataFim", dataFim);

  const query = params.toString();

  return query ? `?${query}` : "";
}

function aplicarFiltrosAuditoria() {
  carregarAuditoria();
}

function limparFiltrosAuditoria() {
  document.getElementById("filtroUsuarioAuditoria").value = "";
  document.getElementById("filtroAcaoAuditoria").value = "";
  document.getElementById("filtroDataInicioAuditoria").value = "";
  document.getElementById("filtroDataFimAuditoria").value = "";

  carregarAuditoria();
}