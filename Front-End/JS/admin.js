async function carregarEstadosAdmin() {
  try {
    const estados = await buscarEstados();
    const selectEstado = document.getElementById("estado");

    selectEstado.innerHTML = `<option value="">Selecione</option>`;

    estados.forEach(function (estado) {
      selectEstado.innerHTML += `<option value="${estado}">${estado}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar estados:", erro);
    alert("Erro ao carregar estados.");
  }
}

async function carregarFiliaisAdmin() {
  const estado = document.getElementById("estado").value;
  const selectFilial = document.getElementById("filial");

  selectFilial.innerHTML = `<option value="">Sem filial específica</option>`;

  if (!estado) {
    return;
  }

  try {
    const filiais = await buscarFiliaisPorEstado(estado);

    filiais.forEach(function (filial) {
      selectFilial.innerHTML += `<option value="${filial}">${filial}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar filiais:", erro);
    alert("Erro ao carregar filiais.");
  }
}

function limparFormularioAdmin() {
  document.getElementById("processo").value = "";
  document.getElementById("estado").value = "";
  document.getElementById("filial").innerHTML = `<option value="">Sem filial específica</option>`;
  document.getElementById("titulo").value = "";
  document.getElementById("instrucao").value = "";
}

async function salvarTarefa() {
  const processo = document.getElementById("processo").value;
  const estado = document.getElementById("estado").value;
  const filial = document.getElementById("filial").value;
  const titulo = document.getElementById("titulo").value.trim();
  const instrucaoTexto = document.getElementById("instrucao").value.trim();

  if (!processo || !estado || !titulo || !instrucaoTexto) {
    alert("Preencha processo, estado, título e instruções.");
    return;
  }

  const instrucao = instrucaoTexto
    .split("\n")
    .map(function (linha) {
      return linha.trim();
    })
    .filter(function (linha) {
      return linha !== "";
    });

  const novaTarefa = {
    processo,
    estado,
    filial,
    titulo,
    instrucao
  };

  try {
    await criarTarefaAPI(novaTarefa);
    alert("Tarefa cadastrada com sucesso.");
    limparFormularioAdmin();
    await carregarTarefasAdminTela();
  } catch (erro) {
    console.error("Erro ao salvar tarefa:", erro);
    alert("Erro ao salvar tarefa.");
  }
}

async function excluirTarefa(id) {
  const confirmar = confirm("Deseja realmente excluir esta tarefa?");

  if (!confirmar) {
    return;
  }

  try {
    await excluirTarefaAPI(id);
    await carregarTarefasAdminTela();
  } catch (erro) {
    console.error("Erro ao excluir tarefa:", erro);
    alert("Erro ao excluir tarefa.");
  }
}

async function carregarTarefasAdminTela() {
  const container = document.getElementById("listaTarefasAdmin");

  try {
    const tarefas = await buscarTarefasAdmin();

    if (!tarefas.length) {
      container.innerHTML = `
        <div class="empty-history">
          <h3>Nenhuma tarefa cadastrada</h3>
          <p>Cadastre uma nova tarefa para ela aparecer aqui.</p>
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
              <button class="danger-outline-button small-button" onclick="excluirTarefa('${tarefa.id}')">
                Excluir
              </button>
            </div>
          </div>
        `;
      });

    container.innerHTML = html;
  } catch (erro) {
    console.error("Erro ao carregar tarefas admin:", erro);
    alert("Erro ao carregar tarefas.");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  if (!exigirLogin() || !exigirArea()) {
    return;
  }

  document.getElementById("estado").addEventListener("change", carregarFiliaisAdmin);

  await carregarEstadosAdmin();
  await carregarTarefasAdminTela();
});