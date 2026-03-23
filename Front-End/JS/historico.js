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
    console.log("ID recebido:", id);

    if (typeof buscarHistoricoAPI !== "function") {
      throw new Error("Função buscarHistoricoAPI não encontrada.");
    }

    const historico = await buscarHistoricoAPI();
    console.log("Histórico carregado:", historico);

    const item = historico.find(function (h) {
      return String(h.id) === String(id);
    });

    console.log("Item encontrado:", item);

    if (!item) {
      throw new Error("Registro não encontrado no histórico.");
    }

    const modal = document.getElementById("modalDetalhes");
    const conteudo = document.getElementById("conteudoDetalhes");

    if (!modal) {
      throw new Error("Elemento #modalDetalhes não existe no HTML.");
    }

    if (!conteudo) {
      throw new Error("Elemento #conteudoDetalhes não existe no HTML.");
    }

    let html = `
      <div style="margin-bottom:15px;">
        <strong>Processo:</strong> ${item.processo || "-"}<br>
        <strong>Competência:</strong> ${formatarCompetencia(item.competencia || "")}<br>
        <strong>Usuário:</strong> ${item.usuario || "-"}<br>
        <strong>Data:</strong> ${item.finalizadoEm || "-"}
      </div>
    `;

    if (Array.isArray(item.tarefas) && item.tarefas.length > 0) {
      item.tarefas.forEach(function (tarefa, i) {
        html += `
          <div style="padding:8px; margin-bottom:6px; border-radius:6px; background:#f5f5f5;">
            ${tarefa.concluida ? "✅" : "❌"} ${i + 1}. ${tarefa.titulo || "Sem título"}
          </div>
        `;
      });
    } else {
      html += `
        <div style="padding:10px; border-radius:6px; background:#fff3cd; color:#856404;">
          Esse checklist não possui tarefas detalhadas salvas.
        </div>
      `;
    }

    conteudo.innerHTML = html;
    modal.style.display = "flex";

  } catch (erro) {
    console.error("Erro real ao carregar detalhes:", erro);
    alert("Erro ao carregar detalhes: " + erro.message);
  }
}

function fecharModalDetalhes() {
  const modal = document.getElementById("modalDetalhes");
  if (modal) {
    modal.style.display = "none";
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