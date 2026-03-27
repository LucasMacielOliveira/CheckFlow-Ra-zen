let tarefasAtuais = [];
let finalizandoChecklist = false;

function $(id) {
  return document.getElementById(id);
}

function setDisplay(id, value) {
  const el = $(id);
  if (el) el.style.display = value;
}

function mostrarMensagem(msg, tipo = "info") {
  if (typeof mostrarToast === "function") {
    mostrarToast(msg, tipo);
  } else {
    alert(msg);
  }
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// =======================
// RESUMO (NOVO VISUAL)
// =======================

function montarResumo() {
  const processo = lerTexto("processoSelecionado");
  const estados = lerLista("estadosSelecionados");
  const filiais = lerLista("filiaisSelecionadas");
  const competencia = lerTexto("competenciaSelecionada");

  const html = `
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">Processo</span>
        <span class="summary-value">${escaparHtml(processo || "-")}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Competência</span>
        <span class="summary-value">${escaparHtml(competencia || "-")}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Estados</span>
        <span class="summary-value">${escaparHtml(estados.join(", ") || "-")}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Filiais</span>
        <span class="summary-value">${escaparHtml(filiais.join(", ") || "-")}</span>
      </div>
    </div>
  `;

  $("infoResumo").innerHTML = html;
}

// =======================
// CHECKLIST
// =======================

async function carregarChecklist() {
  const processo = lerTexto("processoSelecionado");

  try {
    setDisplay("loadingChecklist", "flex");

    const tarefas = await buscarTarefas(processo);
    tarefasAtuais = tarefas || [];

    renderizarChecklist(tarefasAtuais);
    ativarAutoSave();

  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao carregar checklist", "error");
  } finally {
    setDisplay("loadingChecklist", "none");
  }
}

// =======================
// RENDER
// =======================

function renderizarChecklist(tarefas) {
  const container = $("checklistContainer");

  container.innerHTML = tarefas.map((t, i) => `
    <div class="task">
      <div class="task-top">
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" id="task-${i}">
          <label class="task-title" for="task-${i}">
            ${escaparHtml(t.titulo)}
          </label>
        </div>

        <button
          class="instruction-button"
          id="btn-instrucao-${i}"
          onclick="toggleInstrucao(${i})"
        >
          Ver instrução
        </button>
      </div>

      <div id="instrucao-${i}" class="instruction-box" style="display:none;">
        ${(t.instrucao || []).join("<br>")}
      </div>
    </div>
  `).join("");

  atualizarProgressoChecklist();
  atualizarEstadoVisualTarefas();
}

// =======================
// PROGRESSO
// =======================

function atualizarProgressoChecklist() {
  const checks = document.querySelectorAll(".task-checkbox");
  const total = checks.length;
  const done = [...checks].filter(c => c.checked).length;
  const perc = total ? Math.round((done / total) * 100) : 0;

  $("progressFill").style.width = perc + "%";
  $("progressText").textContent = perc + "%";
  $("progressoChecklist").textContent = `${done} de ${total}`;
}

// =======================
// VISUAL TASK
// =======================

function atualizarEstadoVisualTarefas() {
  const tarefas = document.querySelectorAll(".task");
  const checks = document.querySelectorAll(".task-checkbox");

  tarefas.forEach((task, i) => {
    task.classList.toggle("concluida", checks[i]?.checked);
  });
}

// =======================
// AUTOSAVE
// =======================

function ativarAutoSave() {
  document.querySelectorAll(".task-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      atualizarProgressoChecklist();
      atualizarEstadoVisualTarefas();
    });
  });
}

// =======================
// INSTRUÇÃO
// =======================

function toggleInstrucao(i) {
  const box = $("instrucao-" + i);
  const btn = $("btn-instrucao-" + i);

  const aberto = box.style.display === "block";

  box.style.display = aberto ? "none" : "block";
  btn.textContent = aberto ? "Ver instrução" : "Ocultar instrução";
}

// =======================
// FINALIZAR
// =======================

async function validarChecklist() {
  if (finalizandoChecklist) return;

  const checks = document.querySelectorAll(".task-checkbox");
  const todos = [...checks].every(c => c.checked);

  if (!todos) {
    setDisplay("modal", "flex");
    return;
  }

  try {
    finalizandoChecklist = true;

    await salvarFinalizacaoChecklist();

    // 🔥 SÓ MODAL (SEM TOAST)
    $("modalSucesso").style.display = "flex";

  } catch (e) {
    mostrarMensagem("Erro ao salvar checklist", "error");
  } finally {
    finalizandoChecklist = false;
  }
}

// =======================
// MODAIS
// =======================

function fecharModal() {
  setDisplay("modal", "none");
}

function fecharModalSucesso() {
  setDisplay("modalSucesso", "none");
}

function irParaHistorico() {
  window.location.href = "historico.html";
}

// =======================
// INIT
// =======================

document.addEventListener("DOMContentLoaded", () => {
  montarResumo();
  carregarChecklist();
});

// EXPORT
window.validarChecklist = validarChecklist;
window.fecharModal = fecharModal;
window.fecharModalSucesso = fecharModalSucesso;
window.irParaHistorico = irParaHistorico;
window.toggleInstrucao = toggleInstrucao;