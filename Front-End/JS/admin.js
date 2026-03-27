let tarefasAdminCache = [];
let tarefaEmEdicaoId = null;

function normalizarTexto(valor) {
  return String(valor || "").trim();
}

function normalizarListaInstrucao(texto) {
  return String(texto || "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obterElementosAdmin() {
  return {
    processo: document.getElementById("processo"),
    estado: document.getElementById("estado"),
    filial: document.getElementById("filial"),
    titulo: document.getElementById("titulo"),
    instrucao: document.getElementById("instrucao"),
    filtroProcesso: document.getElementById("filtroProcesso"),
    filtroEstado: document.getElementById("filtroEstado"),
    filtroFilial: document.getElementById("filtroFilial"),
    lista: document.getElementById("listaTarefas"),
    secaoFilial: document.getElementById("campoFilial"),
    btnSalvar: document.getElementById("btnSalvar"),
    btnCancelarEdicao: document.getElementById("btnCancelarEdicao")
  };
}

function processoExigeFilial(processo) {
  return processo === "SCANC" || processo === "Apuração";
}

function processoExigeEstado(processo) {
  return processo === "SPED" || processo === "SCANC" || processo === "Apuração";
}

async function carregarEstadosAdmin() {
  const { estado, filtroEstado } = obterElementosAdmin();

  try {
    const estados = await buscarEstados();

    if (estado) {
      estado.innerHTML = `<option value="">Selecione o estado</option>`;
      estados.forEach((uf) => {
        estado.innerHTML += `<option value="${escaparHtml(uf)}">${escaparHtml(uf)}</option>`;
      });
    }

    if (filtroEstado) {
      filtroEstado.innerHTML = `<option value="">Todos os estados</option>`;
      estados.forEach((uf) => {
        filtroEstado.innerHTML += `<option value="${escaparHtml(uf)}">${escaparHtml(uf)}</option>`;
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar estados:", erro);
    alert("Erro ao carregar estados.");
  }
}

async function carregarFiliaisAdmin(estadoSelecionado, selectId = "filial", placeholder = "Selecione a filial") {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = `<option value="">${placeholder}</option>`;

  if (!estadoSelecionado) return;

  try {
    const filiais = await buscarFiliaisPorEstado(estadoSelecionado);

    filiais.forEach((filial) => {
      select.innerHTML += `<option value="${escaparHtml(filial)}">${escaparHtml(filial)}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar filiais:", erro);
    alert("Erro ao carregar filiais.");
  }
}

function aplicarRegraProcesso() {
  const { processo, estado, filial, secaoFilial } = obterElementosAdmin();
  const processoSelecionado = normalizarTexto(processo?.value);

  if (!processo || !estado || !filial || !secaoFilial) return;

  if (processoExigeEstado(processoSelecionado)) {
    estado.disabled = false;
  } else {
    estado.value = "";
    estado.disabled = true;
  }

  if (processoExigeFilial(processoSelecionado)) {
    secaoFilial.style.display = "block";
    filial.disabled = false;
  } else {
    secaoFilial.style.display = "none";
    filial.value = "";
    filial.disabled = true;
  }
}

function limparFormularioAdmin() {
  const {
    processo,
    estado,
    filial,
    titulo,
    instrucao,
    btnSalvar,
    btnCancelarEdicao
  } = obterElementosAdmin();

  if (processo) processo.value = "";
  if (estado) {
    estado.value = "";
    estado.disabled = false;
  }
  if (filial) {
    filial.innerHTML = `<option value="">Selecione a filial</option>`;
    filial.value = "";
    filial.disabled = true;
  }
  if (titulo) titulo.value = "";
  if (instrucao) instrucao.value = "";

  if (btnSalvar) btnSalvar.textContent = "Salvar tarefa";
  if (btnCancelarEdicao) btnCancelarEdicao.style.display = "none";

  tarefaEmEdicaoId = null;
  aplicarRegraProcesso();
}

function validarFormularioAdmin(dados) {
  if (!dados.processo) {
    throw new Error("Selecione o processo.");
  }

  if (processoExigeEstado(dados.processo) && !dados.estado) {
    throw new Error("Selecione o estado.");
  }

  if (processoExigeFilial(dados.processo) && !dados.filial) {
    throw new Error("Selecione a filial.");
  }

  if (!dados.titulo) {
    throw new Error("Informe o título da tarefa.");
  }

  if (!dados.instrucao.length) {
    throw new Error("Informe ao menos uma instrução.");
  }
}

function coletarDadosFormularioAdmin() {
  const { processo, estado, filial, titulo, instrucao } = obterElementosAdmin();

  const dados = {
    processo: normalizarTexto(processo?.value),
    estado: normalizarTexto(estado?.value),
    filial: normalizarTexto(filial?.value),
    titulo: normalizarTexto(titulo?.value),
    instrucao: normalizarListaInstrucao(instrucao?.value)
  };

  validarFormularioAdmin(dados);
  return dados;
}

function filtrarTarefasAdmin() {
  const { filtroProcesso, filtroEstado, filtroFilial } = obterElementosAdmin();

  const processo = normalizarTexto(filtroProcesso?.value);
  const estado = normalizarTexto(filtroEstado?.value);
  const filial = normalizarTexto(filtroFilial?.value);

  return tarefasAdminCache.filter((tarefa) => {
    if (processo && tarefa.processo !== processo) return false;
    if (estado && tarefa.estado !== estado) return false;
    if (filial && tarefa.filial !== filial) return false;
    return true;
  });
}

function renderizarTarefasAdmin() {
  const { lista } = obterElementosAdmin();
  if (!lista) return;

  const tarefasFiltradas = filtrarTarefasAdmin();

  if (!tarefasFiltradas.length) {
    lista.innerHTML = `<div class="empty-state">Nenhuma tarefa encontrada.</div>`;
    return;
  }

  lista.innerHTML = tarefasFiltradas
    .map((tarefa) => {
      const instrucoes = Array.isArray(tarefa.instrucao) ? tarefa.instrucao : [];
      const instrucoesHtml = instrucoes.length
        ? instrucoes.map((item) => `<div>${escaparHtml(item)}</div>`).join("")
        : `<div>Sem instruções.</div>`;

      return `
        <div class="task-card" data-id="${escaparHtml(tarefa.id)}">
          <div class="task-card-header">
            <h3>${escaparHtml(tarefa.titulo)}</h3>
            <div class="task-card-actions">
              <button type="button" class="button secondary" onclick="editarTarefa('${escaparHtml(tarefa.id)}')">
                Editar
              </button>
              <button type="button" class="button danger" onclick="excluirTarefa('${escaparHtml(tarefa.id)}')">
                Excluir
              </button>
            </div>
          </div>

          <div class="task-card-meta">
            <span><strong>Processo:</strong> ${escaparHtml(tarefa.processo || "-")}</span>
            <span><strong>Estado:</strong> ${escaparHtml(tarefa.estado || "-")}</span>
            <span><strong>Filial:</strong> ${escaparHtml(tarefa.filial || "-")}</span>
          </div>

          <div class="task-card-body">
            <strong>Instruções:</strong>
            <div class="instruction-list">
              ${instrucoesHtml}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

async function carregarTarefasAdmin() {
  try {
    tarefasAdminCache = await buscarTarefasAdmin();
    renderizarTarefasAdmin();
  } catch (erro) {
    console.error("Erro ao carregar tarefas administrativas:", erro);
    alert("Erro ao carregar tarefas.");
  }
}

async function salvarTarefaAdmin(event) {
  if (event) event.preventDefault();

  try {
    const dados = coletarDadosFormularioAdmin();

    if (tarefaEmEdicaoId) {
      const tarefaAtualizada = await atualizarTarefaAPI(tarefaEmEdicaoId, dados);

      tarefasAdminCache = tarefasAdminCache.map((tarefa) =>
        String(tarefa.id) === String(tarefaEmEdicaoId) ? tarefaAtualizada : tarefa
      );

      alert("Tarefa atualizada com sucesso.");
    } else {
      const novaTarefa = await criarTarefaAPI(dados);
      tarefasAdminCache.push(novaTarefa);
      alert("Tarefa cadastrada com sucesso.");
    }

    limparFormularioAdmin();
    renderizarTarefasAdmin();
  } catch (erro) {
    console.error("Erro ao salvar tarefa:", erro);
    alert(erro.message || "Erro ao salvar tarefa.");
  }
}

async function editarTarefa(id) {
  const tarefa = tarefasAdminCache.find((item) => String(item.id) === String(id));

  if (!tarefa) {
    alert("Tarefa não encontrada.");
    return;
  }

  const {
    processo,
    estado,
    filial,
    titulo,
    instrucao,
    btnSalvar,
    btnCancelarEdicao
  } = obterElementosAdmin();

  tarefaEmEdicaoId = tarefa.id;

  if (processo) processo.value = tarefa.processo || "";
  aplicarRegraProcesso();

  if (estado) {
    estado.value = tarefa.estado || "";
  }

  if (processoExigeFilial(tarefa.processo)) {
    await carregarFiliaisAdmin(tarefa.estado, "filial", "Selecione a filial");
    if (filial) filial.value = tarefa.filial || "";
  }

  if (titulo) titulo.value = tarefa.titulo || "";
  if (instrucao) {
    instrucao.value = Array.isArray(tarefa.instrucao)
      ? tarefa.instrucao.join("\n")
      : "";
  }

  if (btnSalvar) btnSalvar.textContent = "Atualizar tarefa";
  if (btnCancelarEdicao) btnCancelarEdicao.style.display = "inline-flex";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirTarefa(id) {
  const tarefa = tarefasAdminCache.find((item) => String(item.id) === String(id));
  const nome = tarefa?.titulo || "esta tarefa";

  const confirmou = confirm(`Deseja excluir "${nome}"?`);
  if (!confirmou) return;

  try {
    await excluirTarefaAPI(id);

    tarefasAdminCache = tarefasAdminCache.filter(
      (item) => String(item.id) !== String(id)
    );

    if (String(tarefaEmEdicaoId) === String(id)) {
      limparFormularioAdmin();
    }

    renderizarTarefasAdmin();
    alert("Tarefa excluída com sucesso.");
  } catch (erro) {
    console.error("Erro ao excluir tarefa:", erro);
    alert(erro.message || "Erro ao excluir tarefa.");
  }
}

async function atualizarFiliaisPorEstadoAdmin() {
  const { processo, estado } = obterElementosAdmin();

  const processoSelecionado = normalizarTexto(processo?.value);
  const estadoSelecionado = normalizarTexto(estado?.value);

  if (!processoExigeFilial(processoSelecionado)) return;

  await carregarFiliaisAdmin(estadoSelecionado, "filial", "Selecione a filial");
}

async function atualizarFiltroFiliaisAdmin() {
  const { filtroEstado } = obterElementosAdmin();
  const estadoSelecionado = normalizarTexto(filtroEstado?.value);

  await carregarFiliaisAdmin(estadoSelecionado, "filtroFilial", "Todas as filiais");
  renderizarTarefasAdmin();
}

function registrarEventosAdmin() {
  const {
    processo,
    estado,
    filtroProcesso,
    filtroEstado,
    filtroFilial,
    btnCancelarEdicao
  } = obterElementosAdmin();

  if (processo) {
    processo.addEventListener("change", async () => {
      aplicarRegraProcesso();
      const { estado: campoEstado, filial } = obterElementosAdmin();

      if (campoEstado) campoEstado.value = "";
      if (filial) {
        filial.innerHTML = `<option value="">Selecione a filial</option>`;
        filial.value = "";
      }
    });
  }

  if (estado) {
    estado.addEventListener("change", atualizarFiliaisPorEstadoAdmin);
  }

  if (filtroProcesso) {
    filtroProcesso.addEventListener("change", renderizarTarefasAdmin);
  }

  if (filtroEstado) {
    filtroEstado.addEventListener("change", atualizarFiltroFiliaisAdmin);
  }

  if (filtroFilial) {
    filtroFilial.addEventListener("change", renderizarTarefasAdmin);
  }

  if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener("click", limparFormularioAdmin);
  }

  const form = document.getElementById("formTarefa");
  if (form) {
    form.addEventListener("submit", salvarTarefaAdmin);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!exigirLogin() || !exigirAdmin()) return;

  await carregarEstadosAdmin();
  aplicarRegraProcesso();
  registrarEventosAdmin();
  await carregarTarefasAdmin();
});

window.editarTarefa = editarTarefa;
window.excluirTarefa = excluirTarefa;
window.salvarTarefaAdmin = salvarTarefaAdmin;
window.limparFormularioAdmin = limparFormularioAdmin;