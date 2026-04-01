function normalizarTexto(valor) {
  return String(valor || "").trim();
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function processoExigeFilialSolicitacao(processo) {
  return processo === "SCANC" || processo === "Apuração";
}

async function carregarEstadosSolicitacao() {
  const select = document.getElementById("estadoSolicitacao");
  if (!select) return;

  try {
    const estados = await buscarEstados();
    select.innerHTML = `<option value="">Selecione</option>`;

    estados.forEach((estado) => {
      select.innerHTML += `<option value="${escaparHtml(estado)}">${escaparHtml(estado)}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar estados:", erro);
    alert("Erro ao carregar estados.");
  }
}

async function carregarFiliaisSolicitacao(estado) {
  const select = document.getElementById("filialSolicitacao");
  if (!select) return;

  select.innerHTML = `<option value="">Selecione</option>`;

  if (!estado) return;

  try {
    const filiais = await buscarFiliaisPorEstado(estado);

    filiais.forEach((filial) => {
      select.innerHTML += `<option value="${escaparHtml(filial)}">${escaparHtml(filial)}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar filiais:", erro);
    alert("Erro ao carregar filiais.");
  }
}

function aplicarRegraProcessoSolicitacao() {
  const processo = normalizarTexto(document.getElementById("processoSolicitacao")?.value);
  const grupoFilial = document.getElementById("grupoFilialSolicitacao");
  const filial = document.getElementById("filialSolicitacao");

  if (!grupoFilial || !filial) return;

  if (processoExigeFilialSolicitacao(processo)) {
    grupoFilial.style.display = "block";
    filial.disabled = false;
  } else {
    grupoFilial.style.display = "none";
    filial.value = "";
    filial.disabled = true;
  }
}

async function atualizarFiliaisSolicitacao() {
  const processo = normalizarTexto(document.getElementById("processoSolicitacao")?.value);
  const estado = normalizarTexto(document.getElementById("estadoSolicitacao")?.value);

  if (!processoExigeFilialSolicitacao(processo)) {
    return;
  }

  await carregarFiliaisSolicitacao(estado);
}

async function enviarSolicitacao() {
  try {
    const usuario = lerTexto("usuarioLogado");
    const processo = normalizarTexto(document.getElementById("processoSolicitacao")?.value);
    const estado = normalizarTexto(document.getElementById("estadoSolicitacao")?.value);
    const filial = normalizarTexto(document.getElementById("filialSolicitacao")?.value);
    const descricao = normalizarTexto(document.getElementById("descricaoSolicitacao")?.value);

    if (!usuario) {
      alert("Usuário não encontrado.");
      return;
    }

    if (!processo) {
      alert("Selecione o processo.");
      return;
    }

    if (!estado) {
      alert("Selecione o estado.");
      return;
    }

    if (processoExigeFilialSolicitacao(processo) && !filial) {
      alert("Selecione a filial.");
      return;
    }

    if (!descricao || descricao.length < 10) {
      alert("Descreva a necessidade com pelo menos 10 caracteres.");
      return;
    }

    await criarSolicitacaoAPI({
      processo,
      estado,
      filial,
      descricao,
      criadoPor: usuario
    });

    alert("Solicitação enviada com sucesso.");
    window.location.href = "processo.html";
  } catch (erro) {
    console.error("Erro ao enviar solicitação:", erro);
    alert(erro.message || "Erro ao enviar solicitação.");
  }
}

function voltarProcessos() {
  window.location.href = "processo.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!exigirLogin() || !exigirArea()) return;

  await carregarEstadosSolicitacao();
  aplicarRegraProcessoSolicitacao();

  const processo = document.getElementById("processoSolicitacao");
  const estado = document.getElementById("estadoSolicitacao");

  if (processo) {
    processo.addEventListener("change", async () => {
      aplicarRegraProcessoSolicitacao();

      const filial = document.getElementById("filialSolicitacao");
      if (filial) {
        filial.innerHTML = `<option value="">Selecione</option>`;
      }

      await atualizarFiliaisSolicitacao();
    });
  }

  if (estado) {
    estado.addEventListener("change", atualizarFiliaisSolicitacao);
  }
});