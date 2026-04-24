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
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarLista(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean);
  if (!valor) return [];
  return [valor].filter(Boolean);
}

// =======================
// RESUMO
// =======================

function montarResumo() {
  const processo = lerTexto("processoSelecionado");
  const estados = normalizarLista(lerLista("estadosSelecionados"));
  const filiais = normalizarLista(lerLista("filiaisSelecionadas"));
  const competencia = lerTexto("competenciaSelecionada");

  const html = `
    <div class="welcome-msg">Checklist pronto para execução 🚀</div>

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
        <span class="summary-value">${escaparHtml(estados.length ? estados.join(", ") : "-")}</span>
      </div>

      <div class="summary-item">
        <span class="summary-label">Filiais</span>
        <span class="summary-value">${escaparHtml(filiais.length ? filiais.join(", ") : "-")}</span>
      </div>
    </div>
  `;

  const infoResumo = $("infoResumo");
  if (infoResumo) {
    infoResumo.innerHTML = html;
  }
}

// =======================
// CHECKLIST
// =======================

async function carregarChecklist() {
  const processo = lerTexto("processoSelecionado");
  const estados = normalizarLista(lerLista("estadosSelecionados"));
  const filiais = normalizarLista(lerLista("filiaisSelecionadas"));

  if (!processo) {
    mostrarMensagem("Processo não encontrado.", "error");
    return;
  }

  try {
    setDisplay("loadingChecklist", "flex");
    setDisplay("progressWrapper", "none");

    let estadoParam = null;
    let filialParam = null;

    if (processo === "SPED") {
      estadoParam = estados.join(",");
    } else if (processo === "SCANC" || processo === "Apuração") {
      estadoParam = estados[0] || null;
      filialParam = filiais[0] || null;
    } else {
      estadoParam = estados[0] || null;
      filialParam = filiais[0] || null;
    }

    const tarefas = await buscarTarefas(processo, estadoParam, filialParam);

    tarefasAtuais = Array.isArray(tarefas) ? tarefas : [];
    renderizarChecklist(tarefasAtuais);
    carregarProgressoChecklist();
    ativarAutoSave();
  } catch (erro) {
    console.error("Erro ao carregar checklist:", erro);
    mostrarMensagem(erro?.message || "Erro ao carregar checklist.", "error");

    const container = $("checklistContainer");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          Erro ao carregar checklist.
        </div>
      `;
    }
  } finally {
    setDisplay("loadingChecklist", "none");
  }
}

// =======================
// RENDER
// =======================

function renderizarChecklist(tarefas) {
  const container = $("checklistContainer");
  if (!container) return;

  if (!Array.isArray(tarefas) || !tarefas.length) {
    container.innerHTML = `
      <div class="empty-state">
        Nenhuma tarefa encontrada.
      </div>
    `;
    return;
  }

  container.innerHTML = tarefas.map((tarefa, i) => {
    const titulo = escaparHtml(tarefa?.titulo || "Tarefa sem título");
    const instrucoes = Array.isArray(tarefa?.instrucao) ? tarefa.instrucao : [];
    const instrucoesHtml = instrucoes.length
      ? instrucoes.map((item, idx) => `${idx + 1}. ${escaparHtml(item)}`).join("<br>")
      : "Sem instruções cadastradas.";

    return `
      <div class="task">
        <div class="task-top">
          <div class="task-left">
            <input type="checkbox" class="task-checkbox" id="task-${i}">
            <label class="task-title" for="task-${i}">
              ${titulo}
            </label>
          </div>

          <button
            type="button"
            class="instruction-button"
            id="btn-instrucao-${i}"
            onclick="toggleInstrucao(${i})"
          >
            Ver instrução
          </button>
        </div>

        <div id="instrucao-${i}" class="instruction-box" style="display: none;">
          ${instrucoesHtml}
        </div>
      </div>
    `;
  }).join("");

  atualizarProgressoChecklist();
  atualizarEstadoVisualTarefas();
  atualizarEstadoBotaoFinalizar();
}

// =======================
// PROGRESSO
// =======================

function atualizarProgressoChecklist() {
  const checks = document.querySelectorAll(".task-checkbox");
  const total = checks.length;
  const done = [...checks].filter((c) => c.checked).length;
  const perc = total ? Math.round((done / total) * 100) : 0;

  const fill = $("progressFill");
  const text = $("progressText");
  const status = $("progressoChecklist");
  const wrapper = $("progressWrapper");

  if (wrapper) {
    wrapper.style.display = total > 0 ? "block" : "none";
    wrapper.classList.toggle("progress-complete", total > 0 && done === total);
  }

  if (fill) {
    fill.style.width = `${perc}%`;

    if (perc < 40) fill.style.background = "#d9534f";
    else if (perc < 80) fill.style.background = "#f0ad4e";
    else fill.style.background = "#5cb85c";
  }

  if (text) {
    text.textContent = `${perc}%`;
  }

  if (status) {
    status.textContent = `${done} de ${total} tarefas concluídas`;
  }
}

// =======================
// VISUAL TASK
// =======================

function atualizarEstadoVisualTarefas() {
  const tarefas = document.querySelectorAll(".task");
  const checks = document.querySelectorAll(".task-checkbox");

  tarefas.forEach((task, i) => {
    task.classList.toggle("concluida", Boolean(checks[i]?.checked));
  });
}

// =======================
// BOTÃO FINALIZAR
// =======================

function atualizarEstadoBotaoFinalizar() {
  const botao = $("btnFinalizarChecklist");
  const checkboxes = document.querySelectorAll(".task-checkbox");

  if (!botao) return;

  const total = checkboxes.length;
  const concluidas = [...checkboxes].filter((c) => c.checked).length;

  if (finalizandoChecklist) {
    botao.disabled = true;
    botao.textContent = "Salvando...";
    return;
  }

  if (total === 0) {
    botao.disabled = true;
    botao.textContent = "Finalizar Checklist";
    return;
  }

  if (concluidas === total) {
    botao.disabled = false;
    botao.textContent = "Finalizar Checklist";
  } else {
    botao.disabled = true;
    botao.textContent = `Faltam ${total - concluidas} tarefas`;
  }
}

// =======================
// AUTOSAVE
// =======================

function montarChaveChecklist() {
  const processo = lerTexto("processoSelecionado") || "";
  const competencia = lerTexto("competenciaSelecionada") || "";
  const estados = normalizarLista(lerLista("estadosSelecionados")).slice().sort().join("_");
  const filiais = normalizarLista(lerLista("filiaisSelecionadas")).slice().sort().join("_");

  return `checklist_${processo}_${competencia}_${estados}_${filiais}`;
}

function salvarProgressoChecklist() {
  const checkboxes = document.querySelectorAll(".task-checkbox");

  const progresso = tarefasAtuais.map((tarefa, index) => ({
    id: tarefa?.id || tarefa?.titulo || `tarefa_${index}`,
    marcado: Boolean(checkboxes[index]?.checked)
  }));

  localStorage.setItem(montarChaveChecklist(), JSON.stringify(progresso));
}

function carregarProgressoChecklist() {
  const progressoSalvo = localStorage.getItem(montarChaveChecklist());
  if (!progressoSalvo) return;

  try {
    const progresso = JSON.parse(progressoSalvo);
    const mapa = new Map();

    progresso.forEach((item) => {
      if (item?.id) {
        mapa.set(item.id, Boolean(item.marcado));
      }
    });

    const checkboxes = document.querySelectorAll(".task-checkbox");

    tarefasAtuais.forEach((tarefa, index) => {
      const chave = tarefa?.id || tarefa?.titulo || `tarefa_${index}`;
      if (checkboxes[index] && mapa.has(chave)) {
        checkboxes[index].checked = mapa.get(chave);
      }
    });
  } catch (erro) {
    console.error("Erro ao carregar progresso salvo:", erro);
  }

  atualizarProgressoChecklist();
  atualizarEstadoVisualTarefas();
  atualizarEstadoBotaoFinalizar();
}

function limparProgressoChecklist() {
  localStorage.removeItem(montarChaveChecklist());
}

function ativarAutoSave() {
  document.querySelectorAll(".task-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => {
      salvarProgressoChecklist();
      atualizarProgressoChecklist();
      atualizarEstadoVisualTarefas();
      atualizarEstadoBotaoFinalizar();

      const task = cb.closest(".task");
      if (task) {
        task.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    });
  });

  atualizarEstadoBotaoFinalizar();
}

// =======================
// INSTRUÇÃO
// =======================

function toggleInstrucao(i) {
  const box = $("instrucao-" + i);
  const btn = $("btn-instrucao-" + i);

  if (!box || !btn) return;

  const aberto = box.style.display === "block";
  box.style.display = aberto ? "none" : "block";
  btn.textContent = aberto ? "Ver instrução" : "Ocultar instrução";
}

// =======================
// SALVAR HISTÓRICO
// =======================

async function salvarFinalizacaoChecklist() {
  const processo = lerTexto("processoSelecionado");
  const competencia = lerTexto("competenciaSelecionada") || "";
  const estados = normalizarLista(lerLista("estadosSelecionados"));
  const filiais = normalizarLista(lerLista("filiaisSelecionadas"));
  const usuario = lerTexto("usuarioLogado") || "Usuário";

  if (!processo) {
    throw new Error("Processo não encontrado.");
  }

  const checkboxes = document.querySelectorAll(".task-checkbox");

  const tarefasDetalhadas = tarefasAtuais.map((tarefa, index) => ({
    titulo: tarefa?.titulo || `Tarefa ${index + 1}`,
    concluida: Boolean(checkboxes[index]?.checked)
  }));

  const registro = {
    processo,
    competencia,
    estados,
    filiais,
    usuario,
    status: "finalizado",
    totalTarefas: tarefasDetalhadas.length,
    concluidas: tarefasDetalhadas.filter((t) => t.concluida).length,
    tarefas: tarefasDetalhadas
  };

  console.log("REGISTRO ENVIADO:", registro);

  const resposta = await salvarHistoricoAPI(registro);

  limparProgressoChecklist();

  return resposta;
}

// =======================
// FINALIZAR
// =======================

async function validarChecklist() {
  if (finalizandoChecklist) return;

  const checks = document.querySelectorAll(".task-checkbox");
  const todos = checks.length > 0 && [...checks].every((c) => c.checked);

  if (!todos) {
    setDisplay("modal", "flex");
    return;
  }

  try {
    finalizandoChecklist = true;
    atualizarEstadoBotaoFinalizar();

    const historicoSalvo = await salvarFinalizacaoChecklist();
    console.log("HISTÓRICO SALVO:", historicoSalvo);

    if (typeof confetti === "function") {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const modalSucesso = $("modalSucesso");
    if (!modalSucesso) {
      console.error("modalSucesso não encontrado no HTML");
      mostrarMensagem("Erro ao abrir confirmação de sucesso.", "error");
      return;
    }

    modalSucesso.style.display = "flex";
  } catch (e) {
    console.error("ERRO AO SALVAR CHECKLIST:", e);
    mostrarMensagem(e?.message || "Erro ao salvar checklist", "error");
  } finally {
    finalizandoChecklist = false;
    atualizarEstadoBotaoFinalizar();
  }
}
// =======================
// MODAIS E REDIRECIONAMENTO
// =======================

function fecharModal() {
  setDisplay("modal", "none");
}

function irParaSelecaoAtividades() {
  if (typeof limparFluxo === "function") {
    limparFluxo();
  }

  window.location.href = "processo.html";
}

function fecharModalSucesso() {
  setDisplay("modalSucesso", "none");
  irParaSelecaoAtividades();
}

function irParaHistorico() {
  window.location.href = "historico.html";
}

// =======================
// INIT
// =======================

document.addEventListener("DOMContentLoaded", () => {
  if (typeof exigirLogin === "function" && !exigirLogin()) return;
  if (typeof exigirArea === "function" && !exigirArea()) return;
  if (typeof exigirProcesso === "function" && !exigirProcesso()) return;

  montarResumo();
  carregarChecklist();
});

// EXPORT
window.validarChecklist = validarChecklist;
window.fecharModal = fecharModal;
window.fecharModalSucesso = fecharModalSucesso;
window.irParaSelecaoAtividades = irParaSelecaoAtividades;
window.irParaHistorico = irParaHistorico;
window.toggleInstrucao = toggleInstrucao;