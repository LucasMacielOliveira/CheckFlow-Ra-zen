let acaoConfirmada = null;

function voltarParaProcessos() {
  window.location.href = "processo.html";
}

function formatarTextoLista(lista) {
  if (!lista || !lista.length) {
    return "-";
  }
  return lista.join(", ");
}

function formatarCompetencia(valor) {
  if (!valor) {
    return "-";
  }

  const partes = valor.split("-");
  if (partes.length !== 2) {
    return valor;
  }

  return `${partes[1]}/${partes[0]}`;
}

function abrirModalConfirmacao(texto, callback) {
  document.getElementById("textoConfirmacao").textContent = texto;
  acaoConfirmada = callback;
  document.getElementById("modalConfirmacao").style.display = "flex";
}

function fecharModalConfirmacao() {
  document.getElementById("modalConfirmacao").style.display = "none";
  acaoConfirmada = null;
}

function executarAcaoConfirmada() {
  if (typeof acaoConfirmada === "function") {
    acaoConfirmada();
  }
  fecharModalConfirmacao();
}

function confirmarExclusao(id) {
  abrirModalConfirmacao("Deseja realmente excluir este registro do histórico?", function () {
    excluirHistoricoChecklist(id);
    renderizarHistorico();
  });
}

function confirmarLimparHistorico() {
  const historico = lerHistoricoChecklists();

  if (!historico.length) {
    alert("Não há histórico para limpar.");
    return;
  }

  abrirModalConfirmacao("Deseja realmente apagar todo o histórico?", function () {
    limparHistoricoChecklists();
    renderizarHistorico();
  });
}

function renderizarHistorico() {
  const container = document.getElementById("historicoLista");
  const historico = lerHistoricoChecklists();

  if (!historico.length) {
    container.innerHTML = `
      <div class="empty-history">
        <div class="empty-history-icon">🗂️</div>
        <h3>Nenhum checklist finalizado ainda</h3>
        <p>Assim que você finalizar um checklist, ele aparecerá aqui.</p>
      </div>
    `;
    return;
  }

  let html = "";

  historico.forEach(function (item) {
    html += `
      <div class="history-card">
        <div class="history-card-top">
          <div>
            <div class="history-processo">${item.processo || "-"}</div>
            <div class="history-date">${item.finalizadoEm || "-"}</div>
          </div>
          <span class="status-badge ${item.status === "finalizado" ? "success" : "pending"}">
            ${item.status === "finalizado" ? "Concluído" : "Pendente"}
          </span>
        </div>

        <div class="history-grid">
          <div class="history-info-box">
            <span class="history-label">Competência</span>
            <strong>${formatarCompetencia(item.competencia)}</strong>
          </div>

          <div class="history-info-box">
            <span class="history-label">Usuário</span>
            <strong>${item.usuario || "-"}</strong>
          </div>

          <div class="history-info-box full-width">
            <span class="history-label">Estados</span>
            <strong>${formatarTextoLista(item.estados)}</strong>
          </div>

          <div class="history-info-box full-width">
            <span class="history-label">Filiais</span>
            <strong>${formatarTextoLista(item.filiais)}</strong>
          </div>

          <div class="history-info-box">
            <span class="history-label">Concluídas</span>
            <strong>${item.concluidas || 0}/${item.totalTarefas || 0}</strong>
          </div>

          <div class="history-info-box">
            <span class="history-label">ID</span>
            <strong>${item.id}</strong>
          </div>
        </div>

        <div class="history-card-actions">
          <button class="danger-outline-button small-button" onclick="confirmarExclusao('${item.id}')">
            Excluir
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

if (exigirLogin() && exigirArea()) {
  renderizarHistorico();
}
