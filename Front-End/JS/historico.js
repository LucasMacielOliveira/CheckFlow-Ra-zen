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
  if (!valor) return "-";

  const partes = valor.split("-");
  if (partes.length !== 2) return valor;

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
  abrirModalConfirmacao("Deseja realmente excluir este registro?", async function () {
    try {
      await excluirHistoricoAPI(id);
      await renderizarHistorico();
    } catch (erro) {
      console.error("Erro ao excluir:", erro);
      alert("Erro ao excluir registro.");
    }
  });
}

function confirmarLimparHistorico() {
  abrirModalConfirmacao("Deseja apagar todo o histórico?", async function () {
    try {
      await limparHistoricoAPI();
      await renderizarHistorico();
    } catch (erro) {
      console.error("Erro ao limpar:", erro);
      alert("Erro ao limpar histórico.");
    }
  });
}


async function verDetalhes(id) {
  try {
    const historico = await buscarHistoricoAPI();

    const item = historico.find(h => String(h.id) === String(id));
    if (!item) return;

    let html = `
      <div style="margin-bottom:15px;">
        <strong>Processo:</strong> ${item.processo}<br>
        <strong>Competência:</strong> ${formatarCompetencia(item.competencia)}<br>
        <strong>Usuário:</strong> ${item.usuario}<br>
        <strong>Data:</strong> ${item.finalizadoEm}
      </div>
    `;

    if (item.tarefas && item.tarefas.length) {
      item.tarefas.forEach((tarefa, i) => {
        html += `
          <div style="padding:8px; margin-bottom:6px; border-radius:6px; background:#f5f5f5;">
            ${tarefa.concluida ? "✅" : "❌"} ${i + 1}. ${tarefa.titulo}
          </div>
        `;
      });
    } else {
      html += `<p>Nenhuma tarefa encontrada.</p>`;
    }

    document.getElementById("conteudoDetalhes").innerHTML = html;
    document.getElementById("modalDetalhes").style.display = "flex";

  } catch (erro) {
    console.error("Erro ao abrir detalhes:", erro);
    alert("Erro ao carregar detalhes.");
  }
}

function fecharModalDetalhes() {
  document.getElementById("modalDetalhes").style.display = "none";
}

async function renderizarHistorico() {
  const container = document.getElementById("historicoLista");

  try {
    const historico = await buscarHistoricoAPI();

    if (!historico.length) {
      container.innerHTML = `
        <div class="empty-history">
          <h3>Nenhum checklist ainda</h3>
          <p>Finalize um checklist para aparecer aqui.</p>
        </div>
      `;
      return;
    }

    let html = "";

    historico.forEach(item => {
      html += `
        <div class="history-card">

          <div class="history-card-top">
            <div>
              <div class="history-processo">${item.processo}</div>
              <div class="history-date">${item.finalizadoEm}</div>
            </div>

            <span class="status-badge success">
              Concluído
            </span>
          </div>

          <div class="history-grid">
            <div>
              <strong>Competência:</strong> ${formatarCompetencia(item.competencia)}
            </div>

            <div>
              <strong>Usuário:</strong> ${item.usuario}
            </div>

            <div>
              <strong>Estados:</strong> ${formatarTextoLista(item.estados)}
            </div>

            <div>
              <strong>Filiais:</strong> ${formatarTextoLista(item.filiais)}
            </div>

            <div>
              <strong>Concluídas:</strong> ${item.concluidas}/${item.totalTarefas}
            </div>
          </div>

          <div class="history-card-actions">
            <button onclick="verDetalhes('${item.id}')">
              Ver detalhes
            </button>

            <button onclick="confirmarExclusao('${item.id}')">
              Excluir
            </button>
          </div>

        </div>
      `;
    });

    container.innerHTML = html;

  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
    alert("Erro ao carregar histórico.");
  }
}



if (exigirLogin() && exigirArea()) {
  renderizarHistorico();
}