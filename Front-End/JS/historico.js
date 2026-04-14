let historicoCache = [];
let idParaExcluir = null;

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obterElemento(id) {
  return document.getElementById(id);
}

function obterUsuarioAtual() {
  return lerTexto("usuarioLogado") || "";
}

function usuarioEhAdmin() {
  return lerTexto("perfilUsuario") === "admin";
}

function formatarLista(lista) {
  if (!Array.isArray(lista) || !lista.length) {
    return "-";
  }

  return lista.map((item) => escaparHtml(item)).join(", ");
}

function abrirModalConfirmacao(id) {
  idParaExcluir = id;
  const modal = obterElemento("modalConfirmacao");
  if (modal) {
    modal.style.display = "flex";
  }
}

function fecharModalConfirmacao() {
  idParaExcluir = null;
  const modal = obterElemento("modalConfirmacao");
  if (modal) {
    modal.style.display = "none";
  }
}

function abrirModalDetalhes() {
  const modal = obterElemento("modalDetalhes");
  if (modal) {
    modal.style.display = "flex";
  }
}

function fecharModalDetalhes() {
  const modal = obterElemento("modalDetalhes");
  const conteudo = obterElemento("conteudoDetalhes");

  if (modal) {
    modal.style.display = "none";
  }

  if (conteudo) {
    conteudo.innerHTML = "";
  }
}

function formatarTarefasDetalhes(tarefas) {
  if (!Array.isArray(tarefas) || !tarefas.length) {
    return `<p>Nenhuma tarefa registrada.</p>`;
  }

  return `
    <div class="detalhes-tarefas-lista">
      ${tarefas.map((tarefa) => {
        const titulo = escaparHtml(tarefa?.titulo || "Tarefa sem título");
        const concluida = Boolean(tarefa?.concluida);

        return `
          <div class="detalhe-tarefa-item ${concluida ? "concluida" : "pendente"}">
            <span class="detalhe-status">${concluida ? "✔" : "○"}</span>
            <span class="detalhe-titulo">${titulo}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function atualizarCabecalhoHistorico() { // ajusta títulos e descrições com base no perfil do usuário
  const titulo = document.getElementById("tituloHistorico");
  const descricao = document.getElementById("descricaoHistorico");
  const botaoLimpar = document.getElementById("btnLimparHistorico");

  if (usuarioEhAdmin()) {
    if (titulo) titulo.textContent = "Histórico de Checklists";
    if (descricao) {
      descricao.textContent = "Consulte os checklists finalizados e remova registros quando necessário.";
    }
    if (botaoLimpar) botaoLimpar.style.display = "inline-flex";
  } else {
    if (titulo) titulo.textContent = "Meu histórico";
    if (descricao) {
      descricao.textContent = "Consulte apenas os checklists finalizados por você.";
    }
    if (botaoLimpar) botaoLimpar.style.display = "none";
  }
}

function renderizarHistorico() { // renderiza os registros do histórico na tela, mostrando mensagens adequadas para casos de erro ou ausência de dados
  const container = obterElemento("historyList");
  if (!container) return;

  if (!Array.isArray(historicoCache) || !historicoCache.length) {
    container.innerHTML = `
      <div class="empty-state">
        Nenhum checklist finalizado encontrado.
      </div>
    `;
    return;
  }
 
  container.innerHTML = historicoCache.map((item) => {
    const processo = escaparHtml(item.processo || "-");
    const competencia = escaparHtml(item.competencia || "-");
    const usuario = escaparHtml(item.usuario || "-");
    const finalizadoEm = escaparHtml(item.finalizadoEm || "-");
    const estados = formatarLista(item.estados);
    const filiais = formatarLista(item.filiais);
    const total = Number(item.totalTarefas || 0);
    const concluidas = Number(item.concluidas || 0);
    const id = escaparHtml(item.id);

    return `
      <div class="history-card">
        <div class="history-card-header">
          <div>
            <h3>${processo}</h3>
            <p><strong>Competência:</strong> ${competencia}</p>
          </div>
          <span class="status-badge finalizado">Finalizado</span>
        </div>

        <div class="history-card-body">
          <p><strong>Estados:</strong> ${estados}</p>
          <p><strong>Filiais:</strong> ${filiais}</p>
          <p><strong>Usuário:</strong> ${usuario}</p>
          <p><strong>Finalizado em:</strong> ${finalizadoEm}</p>
          <p><strong>Progresso:</strong> ${concluidas}/${total}</p>
        </div>

        <div class="history-card-actions">
          <button
            type="button"
            class="button secondary"
            onclick="verDetalhes('${id}')"
          >
            Ver detalhes
          </button>

          <button
            type="button"
            class="button danger"
            onclick="abrirModalConfirmacao('${id}')"
          >
            Excluir
          </button>
        </div>
      </div>
    `;
  }).join("");
}

async function carregarHistorico() {
  const loading = document.getElementById("loadingHistorico");
  const container = document.getElementById("historyList");

  try {
    if (loading) loading.style.display = "flex";
    if (container) container.innerHTML = "";

    const usuario = usuarioEhAdmin() ? "" : obterUsuarioAtual();
    historicoCache = await buscarHistoricoAPI(usuario);

    if (!Array.isArray(historicoCache)) {
      historicoCache = [];
    }

   historicoCache.sort((a, b) => {
  const dataA = new Date(a.finalizadoEmIso || a.finalizadoEm || 0).getTime() || 0;
  const dataB = new Date(b.finalizadoEmIso || b.finalizadoEm || 0).getTime() || 0;
  return dataB - dataA;
});

    renderizarHistorico();
  } catch (erro) {
    console.error("Erro detalhado ao carregar histórico:", erro);
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          Erro ao carregar histórico.
        </div>
      `;
    }
  } finally {
    if (loading) loading.style.display = "none";
  }
}

function verDetalhes(id) {
  const item = historicoCache.find((registro) => String(registro.id) === String(id));

  if (!item) {
    alert("Registro não encontrado.");
    return;
  }

  const conteudo = obterElemento("conteudoDetalhes");
  if (!conteudo) return;

  conteudo.innerHTML = `
    <div class="detalhes-bloco">
      <p><strong>Processo:</strong> ${escaparHtml(item.processo || "-")}</p>
      <p><strong>Competência:</strong> ${escaparHtml(item.competencia || "-")}</p>
      <p><strong>Estados:</strong> ${formatarLista(item.estados)}</p>
      <p><strong>Filiais:</strong> ${formatarLista(item.filiais)}</p>
      <p><strong>Usuário:</strong> ${escaparHtml(item.usuario || "-")}</p>
      <p><strong>Finalizado em:</strong> ${escaparHtml(item.finalizadoEm || "-")}</p>
      <p><strong>Status:</strong> ${escaparHtml(item.status || "-")}</p>
      <p><strong>Progresso:</strong> ${Number(item.concluidas || 0)}/${Number(item.totalTarefas || 0)}</p>
    </div>

    <div class="detalhes-bloco">
      <h4>Tarefas</h4>
      ${formatarTarefasDetalhes(item.tarefas)}
    </div>
  `;

  abrirModalDetalhes();
}

async function confirmarExclusaoHistorico() {
  if (!idParaExcluir) return;

  try {
    await excluirHistoricoAPI(idParaExcluir);

    historicoCache = historicoCache.filter(
      (item) => String(item.id) !== String(idParaExcluir)
    );

    fecharModalConfirmacao();
    renderizarHistorico();
    alert("Registro excluído com sucesso.");
  } catch (erro) {
    console.error("Erro ao excluir registro:", erro);
    alert(erro.message || "Erro ao excluir registro.");
  }
}

async function limparHistoricoCompleto() {
  if (!usuarioEhAdmin()) return;

  const confirmou = confirm("Deseja apagar todo o histórico?");
  if (!confirmou) return;

  try {
    await limparHistoricoAPI();
    historicoCache = [];
    renderizarHistorico();
    alert("Histórico limpo com sucesso.");
  } catch (erro) {
    console.error("Erro ao limpar histórico:", erro);
    alert(erro.message || "Erro ao limpar histórico.");
  }
}

function voltarChecklist() {
  window.location.href = "processo.html";
}

function registrarEventosHistorico() {
  const btnConfirmar = obterElemento("btnConfirmarExclusao");
  const btnCancelar = obterElemento("btnCancelarExclusao");
  const btnFecharDetalhes = obterElemento("btnFecharDetalhes");
  const btnLimparHistorico = obterElemento("btnLimparHistorico");

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", confirmarExclusaoHistorico);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", fecharModalConfirmacao);
  }

  if (btnFecharDetalhes) {
    btnFecharDetalhes.addEventListener("click", fecharModalDetalhes);
  }

  if (btnLimparHistorico) {
    btnLimparHistorico.addEventListener("click", limparHistoricoCompleto);
  }

  window.addEventListener("click", (event) => {
    const modalConfirmacao = obterElemento("modalConfirmacao");
    const modalDetalhes = obterElemento("modalDetalhes");

    if (event.target === modalConfirmacao) {
      fecharModalConfirmacao();
    }

    if (event.target === modalDetalhes) {
      fecharModalDetalhes();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!exigirLogin() || !exigirArea()) return;

  atualizarCabecalhoHistorico();
  registrarEventosHistorico();
  await carregarHistorico();
});

window.abrirModalConfirmacao = abrirModalConfirmacao;
window.verDetalhes = verDetalhes;
window.voltarChecklist = voltarChecklist;