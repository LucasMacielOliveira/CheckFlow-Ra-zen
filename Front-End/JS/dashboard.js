document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin()) return;

  iniciarPagina();
});

function montarQueryDashboard() {
  const dataInicio = document.getElementById("filtroDataInicio")?.value || "";
  const dataFim = document.getElementById("filtroDataFim")?.value || "";
  const processo = document.getElementById("filtroProcesso")?.value || "";

  const perfil = lerTexto("perfilUsuario");
  const usuario = lerTexto("usuarioLogado");

  const params = new URLSearchParams();

  if (dataInicio) params.append("dataInicio", dataInicio);
  if (dataFim) params.append("dataFim", dataFim);
  if (processo) params.append("processo", processo);

  if (perfil !== "admin" && usuario) {
    params.append("usuario", usuario);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}


async function buscarResumoDashboard() {
  const query = montarQueryDashboard();
  return request(`/dashboard/resumo${query}`);
}

function getElement(id) {
  return document.getElementById(id);
}

function setTexto(id, valor) {
  const elemento = getElement(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}

function renderDashboardList(containerId, items, campoNome) {
  const container = getElement(containerId);

  if (!container) return;

  if (!Array.isArray(items) || !items.length) {
    container.innerHTML = `<div class="empty-state">Nenhum dado encontrado.</div>`;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const nome = item[campoNome] || "-";
      const total = item.total || 0;

      return `
        <div class="dashboard-list-item">
          <span>${nome}</span>
          <strong>${total}</strong>
        </div>
      `;
    })
    .join("");
}

async function carregarDashboard() {
  const loading = getElement("loadingDashboard");

  try {
    if (loading) loading.style.display = "flex";

    const resumo = await buscarResumoDashboard();

    setTexto("totalChecklists", resumo.totalChecklists || 0);
    setTexto("totalTarefas", resumo.totalTarefas || 0);
    setTexto("tarefasConcluidas", resumo.tarefasConcluidas || 0);
    setTexto("taxaConclusao", `${resumo.taxaConclusao || 0}%`);

    renderDashboardList("listaPorProcesso", resumo.porProcesso, "processo");
    renderDashboardList("listaPorUsuario", resumo.porUsuario, "usuario");
    renderDashboardList("listaPorMes", resumo.porMes, "mes");
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
    alert(erro?.message || "Erro ao carregar dashboard.");
  } finally {
    if (loading) loading.style.display = "none";
  }
}

function voltarProcessos() {
  window.location.href = "processo.html";
}

document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin() || !exigirArea()) {
    return;
  }

  carregarDashboard();
});

function aplicarFiltrosDashboard() {
  carregarDashboard();
}

function limparFiltrosDashboard() {
  const dataInicio = document.getElementById("filtroDataInicio");
  const dataFim = document.getElementById("filtroDataFim");
  const processo = document.getElementById("filtroProcesso");

  if (dataInicio) dataInicio.value = "";
  if (dataFim) dataFim.value = "";
  if (processo) processo.value = "";

  carregarDashboard();
}