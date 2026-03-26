let tarefaEmEdicao = null;
let tarefasAdminCache = [];

async function carregarEstadosAdmin() {
  try {
    const estados = await buscarEstados();

    const selectEstado = document.getElementById("estado");
    const filtroEstado = document.getElementById("filtroEstado");

    selectEstado.innerHTML = `<option value="">Selecione</option>`;
    filtroEstado.innerHTML = `<option value="">Todos os estados</option>`;

    estados.forEach(function (estado) {
      selectEstado.innerHTML += `<option value="${estado}">${estado}</option>`;
      filtroEstado.innerHTML += `<option value="${estado}">${estado}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar estados:", erro);
    alert("Erro ao carregar estados.");
  }
}

async function carregarFiliaisAdmin(valorSelecionado = "") {
  const estado = document.getElementById("estado").value;
  const selectFilial = document.getElementById("filial");

  selectFilial.innerHTML = `<option value="">Sem filial específica</option>`;

  if (!estado) {
    return;
  }

  try {
    const filiais = await buscarFiliaisPorEstado(estado);

    filiais.forEach(function (filial) {
      const selected = filial === valorSelecionado ? "selected" : "";
      selectFilial.innerHTML += `<option value="${filial}" ${selected}>${filial}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar filiais:", erro);
    alert("Erro ao carregar filiais.");
  }
}

function atualizarTextoBotaoAdmin() {
  const botao = document.getElementById("botaoSalvarTarefa");

  if (!botao) {
    return;
  }

  botao.textContent = tarefaEmEdicao ? "Atualizar tarefa" : "Salvar tarefa";
}

function aplicarRegraProcesso() {
  const processo = document.getElementById("processo").value;
  const estado = document.getElementById("estado");
  const filial = document.getElementById("filial");

  if (processo === "SPED") {
    estado.disabled = false;
    filial.disabled = true;
    filial.value = "";
  } else if (processo === "SCANC" || processo === "Apuração") {
    estado.disabled = false;
    filial.disabled = false;
  } else {
    estado.disabled = false;
    filial.disabled = false;
  }
}

function limparFormularioAdmin() {
  tarefaEmEdicao = null;

  document.getElementById("processo").value = "";
  document.getElementById("estado").value = "";
  document.getElementById("filial").innerHTML = `<option value="">Sem filial específica</option>`;
  document.getElementById("titulo").value = "";
  document.getElementById("instrucao").value = "";

  aplicarRegraProcesso();
  atualizarTextoBotaoAdmin();
}

function montarObjetoTarefaDoFormulario() {
  const processo = document.getElementById("processo").value;
  const estado = document.getElementById("estado").value;
  const filial = document.getElementById("filial").value || "";
  const titulo = document.getElementById("titulo").value.trim();
  const instrucaoTexto = document.getElementById("instrucao").value.trim();
  const usuarioLogado = localStorage.getItem("usuarioLogado") || "desconhecido";

  if (!processo || !estado || !titulo || !instrucaoTexto) {
    alert("Preencha processo, estado, título e instruções.");
    return null;
  }

  if ((processo === "SCANC" || processo === "Apuração") && !filial) {
    alert("Para SCANC e Apuração, selecione a filial.");
    return null;
  }

  const instrucao = instrucaoTexto
    .split("\n")
    .map(function (linha) {
      return linha.trim();
    })
    .filter(function (linha) {
      return linha !== "";
    });

  return {
    processo,
    estado,
    filial: processo === "SPED" ? "" : filial,
    titulo,
    instrucao,
    atualizadoPor: usuarioLogado,
    criadoPor: usuarioLogado
  };
}

async function salvarTarefa() {
  const tarefa = montarObjetoTarefaDoFormulario();

  if (!tarefa) {
    return;
  }

  try {
    if (tarefaEmEdicao) {
      await atualizarTarefaAPI(tarefaEmEdicao, tarefa);
      alert("Tarefa atualizada com sucesso.");
    } else {
      await criarTarefaAPI(tarefa);
      alert("Tarefa cadastrada com sucesso.");
    }

    limparFormularioAdmin();
    await carregarTarefasAdminTela();
  } catch (erro) {
    console.error("Erro ao salvar tarefa:", erro);
    alert("Erro ao salvar tarefa.");
  }
}

async function editarTarefa(id) {
  try {
    const tarefas = await buscarTarefasAdmin();
    const tarefa = tarefas.find(function (item) {
      return String(item.id) === String(id);
    });

    if (!tarefa) {
      alert("Tarefa não encontrada.");
      return;
    }

    tarefaEmEdicao = tarefa.id;

    document.getElementById("processo").value = tarefa.processo || "";
    aplicarRegraProcesso();

    document.getElementById("estado").value = tarefa.estado || "";
    await carregarFiliaisAdmin(tarefa.filial || "");

    document.getElementById("titulo").value = tarefa.titulo || "";
    document.getElementById("instrucao").value = (tarefa.instrucao || []).join("\n");

    atualizarTextoBotaoAdmin();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  } catch (erro) {
    console.error("Erro ao editar tarefa:", erro);
    alert("Erro ao carregar dados da tarefa.");
  }
}

async function excluirTarefa(id) {
  const confirmar = confirm("Deseja realmente excluir esta tarefa?");

  if (!confirmar) {
    return;
  }

  try {
    await excluirTarefaAPI(id);

    if (String(tarefaEmEdicao) === String(id)) {
      limparFormularioAdmin();
    }

    await carregarTarefasAdminTela();
  } catch (erro) {
    console.error("Erro ao excluir tarefa:", erro);
    alert("Erro ao excluir tarefa.");
  }
}

function obterTarefasFiltradas() {
  const filtroProcesso = document.getElementById("filtroProcesso").value.trim().toLowerCase();
  const filtroEstado = document.getElementById("filtroEstado").value.trim().toLowerCase();
  const filtroFilial = document.getElementById("filtroFilial").value.trim().toLowerCase();
  const filtroTexto = document.getElementById("filtroTexto").value.trim().toLowerCase();

  return tarefasAdminCache.filter(function (tarefa) {
    const processo = (tarefa.processo || "").toLowerCase();
    const estado = (tarefa.estado || "").toLowerCase();
    const filial = (tarefa.filial || "").toLowerCase();
    const titulo = (tarefa.titulo || "").toLowerCase();

    const matchProcesso = !filtroProcesso || processo === filtroProcesso;
    const matchEstado = !filtroEstado || estado === filtroEstado;
    const matchFilial = !filtroFilial || filial.includes(filtroFilial);
    const matchTexto = !filtroTexto || titulo.includes(filtroTexto);

    return matchProcesso && matchEstado && matchFilial && matchTexto;
  });
}

function renderizarListaAdmin() {
  const container = document.getElementById("listaTarefasAdmin");
  const tarefas = obterTarefasFiltradas();

  if (!tarefas.length) {
    container.innerHTML = `
      <div class="empty-history">
        <h3>Nenhuma tarefa encontrada</h3>
        <p>Altere os filtros ou cadastre uma nova tarefa.</p>
      </div>
    `;
    return;
  }

  let html = "";

  tarefas
    .slice()
    .reverse()
    .forEach(function (tarefa) {
      html += `
        <div class="history-card">
          <div class="history-card-top">
            <div>
              <div class="history-processo">${tarefa.processo || "-"}</div>
              <div class="history-date">${tarefa.titulo || "-"}</div>
            </div>
            <span class="status-badge success">Ativa</span>
          </div>

          <div class="history-grid">
            <div class="history-info-box">
              <span class="history-label">Estado</span>
              <strong>${tarefa.estado || "-"}</strong>
            </div>

            <div class="history-info-box">
              <span class="history-label">Filial</span>
              <strong>${tarefa.filial || "Geral"}</strong>
            </div>

            <div class="history-info-box full-width">
              <span class="history-label">Instruções</span>
              <strong>${(tarefa.instrucao || []).join("<br>")}</strong>
            </div>

            <div class="history-info-box">
              <span class="history-label">ID</span>
              <strong>${tarefa.id || "-"}</strong>
            </div>
          </div>

          <div class="history-card-actions">
            <button class="secondary-button small-button" onclick="editarTarefa('${tarefa.id}')">
              Editar
            </button>
            <button class="danger-outline-button small-button" onclick="excluirTarefa('${tarefa.id}')">
              Excluir
            </button>
          </div>
        </div>
      `;
    });

  container.innerHTML = html;
}

async function carregarTarefasAdminTela() {
  try {
    tarefasAdminCache = await buscarTarefasAdmin();
    renderizarListaAdmin();
  } catch (erro) {
    console.error("Erro ao carregar tarefas admin:", erro);
    alert("Erro ao carregar tarefas.");
  }
}

function registrarEventosFiltros() {
  document.getElementById("filtroProcesso").addEventListener("change", renderizarListaAdmin);
  document.getElementById("filtroEstado").addEventListener("change", renderizarListaAdmin);
  document.getElementById("filtroFilial").addEventListener("input", renderizarListaAdmin);
  document.getElementById("filtroTexto").addEventListener("input", renderizarListaAdmin);

  document.getElementById("processo").addEventListener("change", function () {
    aplicarRegraProcesso();
  });

  document.getElementById("estado").addEventListener("change", function () {
    carregarFiliaisAdmin();
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  if (!exigirLogin() || !exigirArea() || !exigirAdmin()) {
  return;
}
  atualizarTextoBotaoAdmin();
  registrarEventosFiltros();
  await carregarEstadosAdmin();
  aplicarRegraProcesso();
  await carregarTarefasAdminTela();
});