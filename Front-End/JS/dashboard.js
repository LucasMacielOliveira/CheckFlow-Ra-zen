async function buscarResumoDashboard() {
  return request("/dashboard/resumo");
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