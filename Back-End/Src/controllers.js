const {
  lerTarefas,
  salvarTarefas,
  lerTarefasPadrao,
  lerSolicitacoes,
  salvarSolicitacoes
} = require("./data");

const {
  saveHistory,
  findHistory
} = require("./repositorios/historico.repository");

const {
  getDashboardSummary
} = require("./repositorios/dashboard.repository");

// DADOS FIXOS

const filiaisPorEstado = {
  "São Paulo": ["Paulínia", "São Paulo", "Ribeirão Preto", "Santos"],
  "Minas Gerais": ["Betim", "Uberlândia", "Juiz de Fora"],
  "Rio de Janeiro": ["Duque de Caxias", "Rio de Janeiro", "Campos"],
  "Paraná": ["Curitiba", "Londrina", "Maringá"],
  "Amazonas": ["Manaus"],
  "Pará": ["Belém"],
  "Sergipe": ["Aracaju"]
};

const estadosDisponiveis = Object.keys(filiaisPorEstado);

// HELPERS

function gerarId(prefixo = "id") {
  return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function normalizarTexto(valor) {
  return String(valor || "").trim();
}

function normalizarInstrucao(instrucao) {
  if (Array.isArray(instrucao)) {
    return instrucao
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(instrucao || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function deduplicarTarefas(lista, processoAtual) {
  const mapa = new Map();

  for (const tarefa of lista) {
    const chave =
      tarefa.id ||
      [
        tarefa.processo || processoAtual || "",
        tarefa.estado || "",
        tarefa.filial || "",
        normalizarTexto(tarefa.titulo).toLowerCase()
      ].join("::");

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        ...tarefa,
        instrucao: normalizarInstrucao(tarefa.instrucao)
      });
    }
  }

  return Array.from(mapa.values());
}

// VALIDAÇÕES

function validarTarefaAdmin(payload) {
  const processo = normalizarTexto(payload.processo);
  const estado = normalizarTexto(payload.estado);
  const filial = normalizarTexto(payload.filial);
  const titulo = normalizarTexto(payload.titulo);
  const instrucao = normalizarInstrucao(payload.instrucao);

  if (!processo) {
    return { erro: "Processo é obrigatório." };
  }

  if (!titulo) {
    return { erro: "Título é obrigatório." };
  }

  if (!instrucao.length) {
    return { erro: "Informe ao menos uma instrução." };
  }

  if (processo === "SPED" && !estado) {
    return { erro: "Estado é obrigatório para SPED." };
  }

  if ((processo === "SCANC" || processo === "Apuração") && (!estado || !filial)) {
    return { erro: "Estado e filial são obrigatórios para este processo." };
  }

  return {
    processo,
    estado,
    filial,
    titulo,
    instrucao
  };
}

function validarSolicitacao(payload) {
  const processo = normalizarTexto(payload.processo);
  const estado = normalizarTexto(payload.estado);
  const filial = normalizarTexto(payload.filial);
  const descricao = normalizarTexto(payload.descricao);
  const criadoPor = normalizarTexto(payload.criadoPor);

  if (!processo) {
    return { erro: "Processo é obrigatório." };
  }

  if (!estado) {
    return { erro: "Estado é obrigatório." };
  }

  if ((processo === "SCANC" || processo === "Apuração") && !filial) {
    return { erro: "Filial é obrigatória para este processo." };
  }

  if (!descricao || descricao.length < 10) {
    return { erro: "Descreva a necessidade com pelo menos 10 caracteres." };
  }

  if (!criadoPor) {
    return { erro: "Usuário solicitante é obrigatório." };
  }

  return {
    processo,
    estado,
    filial: processo === "SPED" ? "" : filial,
    descricao,
    criadoPor
  };
}

function validarHistorico(payload) {
  const processo = normalizarTexto(payload.processo);
  const competencia = normalizarTexto(payload.competencia);
  const usuario = normalizarTexto(payload.usuario);
  const status = normalizarTexto(payload.status) || "finalizado";

  const estados = Array.isArray(payload.estados)
    ? payload.estados.map((item) => normalizarTexto(item)).filter(Boolean)
    : [];

  const filiais = Array.isArray(payload.filiais)
    ? payload.filiais.map((item) => normalizarTexto(item)).filter(Boolean)
    : [];

  const tarefas = Array.isArray(payload.tarefas)
    ? payload.tarefas.map((tarefa, index) => ({
        titulo: normalizarTexto(tarefa?.titulo) || `Tarefa ${index + 1}`,
        concluida: Boolean(tarefa?.concluida)
      }))
    : [];

  const totalTarefas =
    Number.isInteger(payload.totalTarefas) && payload.totalTarefas >= 0
      ? payload.totalTarefas
      : tarefas.length;

  const concluidas =
    Number.isInteger(payload.concluidas) && payload.concluidas >= 0
      ? payload.concluidas
      : tarefas.filter((tarefa) => tarefa.concluida).length;

  if (!processo) {
    return { erro: "Processo é obrigatório." };
  }

  if (!competencia) {
    return { erro: "Competência é obrigatória." };
  }

  if (!usuario) {
    return { erro: "Usuário é obrigatório." };
  }

  if (!tarefas.length) {
    return { erro: "É necessário informar ao menos uma tarefa." };
  }

  if (totalTarefas !== tarefas.length) {
    return { erro: "Total de tarefas inválido." };
  }

  if (concluidas !== tarefas.filter((tarefa) => tarefa.concluida).length) {
    return { erro: "Quantidade de tarefas concluídas inválida." };
  }

  if (concluidas !== totalTarefas) {
    return { erro: "O checklist só pode ser finalizado com todas as tarefas concluídas." };
  }

  return {
    processo,
    competencia,
    estados,
    filiais,
    usuario,
    status,
    totalTarefas,
    concluidas,
    tarefas
  };
}

// CONTROLLERS

function healthCheck(req, res) {
  return res.json({
    ok: true,
    mensagem: "API CheckFlow online."
  });
}

function getEstados(req, res) {
  return res.json(estadosDisponiveis);
}

function getFiliais(req, res) {
  const estado = normalizarTexto(req.query.estado);

  if (!estado) {
    return res.json([]);
  }

  return res.json(filiaisPorEstado[estado] || []);
}

function getTarefas(req, res) {
  try {
    const { processo, estado, filial } = req.query;

    if (!processo) {
      return res.status(400).json({ erro: "Processo é obrigatório." });
    }

    const tarefasPadraoPorProcesso = lerTarefasPadrao();
    const tarefasPadrao = Array.isArray(tarefasPadraoPorProcesso[processo])
      ? tarefasPadraoPorProcesso[processo]
      : [];

    const tarefasExtras = Array.isArray(lerTarefas()) ? lerTarefas() : [];

    const estadosSelecionados = String(estado || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const extrasFiltradas = tarefasExtras.filter((tarefa) => {
      if (!tarefa || tarefa.processo !== processo) return false;

      if (processo === "SPED") {
        if (!tarefa.estado) return false;
        return estadosSelecionados.includes(tarefa.estado);
      }

      if (processo === "SCANC" || processo === "Apuração") {
        const mesmoEstado = !tarefa.estado || tarefa.estado === estado;
        const mesmaFilial = !tarefa.filial || tarefa.filial === filial;
        return mesmoEstado && mesmaFilial;
      }

      return true;
    });

    const resultado = deduplicarTarefas(
      [...tarefasPadrao, ...extrasFiltradas],
      processo
    );

    return res.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return res.status(500).json({ erro: "Erro ao buscar tarefas." });
  }
}

async function getHistorico(req, res) {
  try {
    const usuario = normalizarTexto(req.query.usuario);
    
    const historico = await findHistory(usuario);

    return res.json(historico);
  } catch (error) {
    console.error("Erro ao listar histórico no banco:", error);

    return res.status(500).json({
      erro: "Erro ao listar histórico."
    });
  }
}

async function postHistorico(req, res) {
  try {
    const validacao = validarHistorico(req.body || {});

    if (validacao.erro) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const registro = {
      processo: validacao.processo,
      competencia: validacao.competencia,
      estados: validacao.estados,
      filiais: validacao.filiais,
      usuario: validacao.usuario,
      status: validacao.status,
      totalTarefas: validacao.totalTarefas,
      concluidas: validacao.concluidas,
      tarefas: validacao.tarefas
    };

    const checklistSalvo = await saveHistory(registro);

    return res.status(201).json({
      id: checklistSalvo.id,
      processo: checklistSalvo.processo,
      competencia: checklistSalvo.competencia,
      usuario: checklistSalvo.usuario,
      status: checklistSalvo.status,
      finalizadoEmIso: checklistSalvo.finalizado_em
    });
  } catch (error) {
    console.error("Erro ao salvar histórico no banco:", error);
    return res.status(500).json({ erro: "Erro ao salvar histórico." });
  }
}

function deleteHistoricoPorId(req, res) {
  try {
    return res.status(501).json({
      erro: "Exclusão de histórico no banco ainda não implementada."
    });
  } catch (error) {
    console.error("Erro ao excluir registro do histórico:", error);
    return res.status(500).json({ erro: "Erro ao excluir registro." });
  }
}

function deleteHistorico(req, res) {
  try {
    return res.status(501).json({
      erro: "Limpeza de histórico no banco ainda não implementada."
    });
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
    return res.status(500).json({ erro: "Erro ao limpar histórico." });
  }
}

function getSolicitacoes(req, res) {
  try {
    const status = normalizarTexto(req.query.status);
    const criadoPor = normalizarTexto(req.query.criadoPor);

    let solicitacoes = lerSolicitacoes();

    if (!Array.isArray(solicitacoes)) {
      solicitacoes = [];
    }

    if (status) {
      solicitacoes = solicitacoes.filter(
        (item) => normalizarTexto(item.status).toLowerCase() === status.toLowerCase()
      );
    }

    if (criadoPor) {
      solicitacoes = solicitacoes.filter(
        (item) => normalizarTexto(item.criadoPor).toLowerCase() === criadoPor.toLowerCase()
      );
    }

    solicitacoes.sort((a, b) => {
      const dataA = new Date(a.dataCriacao || 0).getTime();
      const dataB = new Date(b.dataCriacao || 0).getTime();
      return dataB - dataA;
    });

    return res.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    return res.status(500).json({ erro: "Erro ao listar solicitações." });
  }
}

function postSolicitacao(req, res) {
  try {
    const validacao = validarSolicitacao(req.body || {});

    if (validacao.erro) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const solicitacoes = lerSolicitacoes();

    const novaSolicitacao = {
      id: gerarId("sol"),
      tipo: "solicitacao_tarefa",
      processo: validacao.processo,
      estado: validacao.estado,
      filial: validacao.filial,
      descricao: validacao.descricao,
      criadoPor: validacao.criadoPor,
      status: "pendente",
      dataCriacao: new Date().toISOString()
    };

    solicitacoes.push(novaSolicitacao);
    salvarSolicitacoes(solicitacoes);

    return res.status(201).json(novaSolicitacao);
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    return res.status(500).json({ erro: "Erro ao criar solicitação." });
  }
}

function patchSolicitacaoStatus(req, res) {
  try {
    const { id } = req.params;
    const novoStatus = normalizarTexto(req.body?.status);

    if (!["pendente", "atendida", "recusada"].includes(novoStatus)) {
      return res.status(400).json({ erro: "Status inválido." });
    }

    const solicitacoes = lerSolicitacoes();
    const index = solicitacoes.findIndex((item) => String(item.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ erro: "Solicitação não encontrada." });
    }

    solicitacoes[index] = {
      ...solicitacoes[index],
      status: novoStatus,
      atualizadoEm: new Date().toISOString()
    };

    salvarSolicitacoes(solicitacoes);

    return res.json(solicitacoes[index]);
  } catch (error) {
    console.error("Erro ao atualizar status da solicitação:", error);
    return res.status(500).json({ erro: "Erro ao atualizar solicitação." });
  }
}

function getAdminTarefas(req, res) {
  try {
    const tarefas = lerTarefas();
    return res.json(Array.isArray(tarefas) ? tarefas : []);
  } catch (error) {
    console.error("Erro ao listar tarefas admin:", error);
    return res.status(500).json({ erro: "Erro ao listar tarefas." });
  }
}

function postAdminTarefa(req, res) {
  try {
    const validacao = validarTarefaAdmin(req.body || {});

    if (validacao.erro) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const tarefas = lerTarefas();

    const novaTarefa = {
      id: gerarId("extra"),
      processo: validacao.processo,
      estado: validacao.estado,
      filial: validacao.filial,
      titulo: validacao.titulo,
      instrucao: validacao.instrucao
    };

    tarefas.push(novaTarefa);
    salvarTarefas(tarefas);

    const solicitacaoId = normalizarTexto(req.body?.solicitacaoId);

    if (solicitacaoId) {
      const solicitacoes = lerSolicitacoes();
      const indexSolicitacao = solicitacoes.findIndex(
        (item) => String(item.id) === String(solicitacaoId)
      );

      if (indexSolicitacao !== -1) {
        solicitacoes[indexSolicitacao] = {
          ...solicitacoes[indexSolicitacao],
          status: "atendida",
          atualizadoEm: new Date().toISOString()
        };

        salvarSolicitacoes(solicitacoes);
      }
    }

    return res.status(201).json(novaTarefa);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res.status(500).json({ erro: "Erro ao criar tarefa." });
  }
}

function putAdminTarefa(req, res) {
  try {
    const { id } = req.params;
    const validacao = validarTarefaAdmin(req.body || {});

    if (validacao.erro) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const tarefas = lerTarefas();
    const index = tarefas.findIndex((tarefa) => String(tarefa.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ erro: "Tarefa não encontrada." });
    }

    tarefas[index] = {
      ...tarefas[index],
      processo: validacao.processo,
      estado: validacao.estado,
      filial: validacao.filial,
      titulo: validacao.titulo,
      instrucao: validacao.instrucao
    };

    salvarTarefas(tarefas);

    return res.json(tarefas[index]);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return res.status(500).json({ erro: "Erro ao atualizar tarefa." });
  }
}

function deleteAdminTarefa(req, res) {
  try {
    const { id } = req.params;

    const tarefas = lerTarefas();
    const novasTarefas = tarefas.filter(
      (tarefa) => String(tarefa.id) !== String(id)
    );

    if (novasTarefas.length === tarefas.length) {
      return res.status(404).json({ erro: "Tarefa não encontrada." });
    }

    salvarTarefas(novasTarefas);

    return res.json({ mensagem: "Tarefa excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    return res.status(500).json({ erro: "Erro ao excluir tarefa." });
  }
}

async function getDashboard(req, res) {
  try {
    const filtros = {
      dataInicio: normalizarTexto(req.query.dataInicio),
      dataFim: normalizarTexto(req.query.dataFim),
      processo: normalizarTexto(req.query.processo)
    };

    const resumo = await getDashboardSummary(filtros);

    return res.json(resumo);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);

    return res.status(500).json({
      erro: "Erro ao carregar dashboard."
    });
  }
}

module.exports = {
  healthCheck,
  getEstados,
  getFiliais,
  getTarefas,
  getHistorico,
  postHistorico,
  deleteHistoricoPorId,
  deleteHistorico,
  getSolicitacoes,
  postSolicitacao,
  patchSolicitacaoStatus,
  getAdminTarefas,
  postAdminTarefa,
  putAdminTarefa,
  deleteAdminTarefa,
  getDashboard
};