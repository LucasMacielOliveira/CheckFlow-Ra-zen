const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const HISTORICO_FILE = path.join(DATA_DIR, "historico.json");
const TAREFAS_FILE = path.join(DATA_DIR, "tarefas.json");
const TAREFAS_PADRAO_FILE = path.join(DATA_DIR, "tarefas-padrao.json");
const SOLICITACOES_FILE = path.join(DATA_DIR, "solicitacoes.json");

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

//UTILITÁRIOS DE ARQUIVO


function garantirArquivo(caminho, conteudoInicial) {
  if (!fs.existsSync(caminho)) {
    fs.writeFileSync(
      caminho,
      JSON.stringify(conteudoInicial, null, 2),
      "utf-8"
    );
  }
}

function lerJson(caminho, fallback) {
  garantirArquivo(caminho, fallback);

  try {
    const conteudo = fs.readFileSync(caminho, "utf-8").trim();
    if (!conteudo) return fallback;
    return JSON.parse(conteudo);
  } catch (error) {
    console.error(`Erro ao ler ${path.basename(caminho)}:`, error);
    return fallback;
  }
}

function salvarJson(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), "utf-8");
}

function lerHistorico() {
  return lerJson(HISTORICO_FILE, []);
}

function salvarHistorico(dados) {
  salvarJson(HISTORICO_FILE, dados);
}

function lerTarefas() {
  return lerJson(TAREFAS_FILE, []);
}

function salvarTarefas(dados) {
  salvarJson(TAREFAS_FILE, dados);
}

function lerTarefasPadrao() {
  return lerJson(TAREFAS_PADRAO_FILE, {
    SPED: [],
    SCANC: [],
    Apuração: []
  });
}

function lerSolicitacoes() {
  return lerJson(SOLICITACOES_FILE, []);
}

function salvarSolicitacoes(dados) {
  salvarJson(SOLICITACOES_FILE, dados);
}

/* =========================
   UTILITÁRIOS DE NEGÓCIO
========================= */

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

  if (processo === "SPED") {
    // SPED não precisa de filial
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

// ROTAS AUXILIARES


app.get("/", (req, res) => {
  res.json({ ok: true, mensagem: "API CheckFlow online." });
});

app.get("/estados", (req, res) => {
  res.json(estadosDisponiveis);
});

app.get("/filiais", (req, res) => {
  const estado = normalizarTexto(req.query.estado);

  if (!estado) {
    return res.json([]);
  }

  return res.json(filiaisPorEstado[estado] || []);
});

//CHECKLIST


app.get("/tarefas", (req, res) => {
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
});

//HISTÓRICO

app.get("/historico", (req, res) => {
  try {
    const usuario = normalizarTexto(req.query.usuario);
    let historico = lerHistorico();

    if (!Array.isArray(historico)) {
      historico = [];
    }

    if (usuario) {
      historico = historico.filter(
        (item) =>
          normalizarTexto(item.usuario).toLowerCase() === usuario.toLowerCase()
      );
    }

    historico.sort((a, b) => {
      const dataA = new Date(a.finalizadoEmIso || a.finalizadoEm || 0).getTime() || 0;
      const dataB = new Date(b.finalizadoEmIso || b.finalizadoEm || 0).getTime() || 0;
      return dataB - dataA;
    });

    return res.json(historico);
  } catch (error) {
    console.error("Erro ao listar histórico:", error);
    return res.status(500).json({ erro: "Erro ao listar histórico." });
  }
});

app.delete("/historico/:id", (req, res) => {
  try {
    const { id } = req.params;

    const historico = lerHistorico();
    const novoHistorico = historico.filter(
      (item) => String(item.id) !== String(id)
    );

    if (novoHistorico.length === historico.length) {
      return res.status(404).json({ erro: "Registro não encontrado." });
    }

    salvarHistorico(novoHistorico);
    return res.json({ mensagem: "Registro excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir registro do histórico:", error);
    return res.status(500).json({ erro: "Erro ao excluir registro." });
  }
});

app.delete("/historico", (req, res) => {
  try {
    salvarHistorico([]);
    return res.json({ mensagem: "Histórico limpo com sucesso." });
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
    return res.status(500).json({ erro: "Erro ao limpar histórico." });
  }
});

//SOLICITAÇÕES DE TAREFA

app.get("/solicitacoes", (req, res) => {
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
});

app.post("/solicitacoes", (req, res) => {
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
});

app.patch("/solicitacoes/:id/status", (req, res) => {
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
});

// ADMIN - TAREFAS EXTRAS


app.get("/admin/tarefas", (req, res) => {
  try {
    const tarefas = lerTarefas();
    return res.json(Array.isArray(tarefas) ? tarefas : []);
  } catch (error) {
    console.error("Erro ao listar tarefas admin:", error);
    return res.status(500).json({ erro: "Erro ao listar tarefas." });
  }
});

app.post("/admin/tarefas", (req, res) => {
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
});

app.put("/admin/tarefas/:id", (req, res) => {
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
});

app.delete("/admin/tarefas/:id", (req, res) => {
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
});

//START

app.listen(PORT, () => {
  console.log(`Servidor CheckFlow rodando em http://localhost:${PORT}`);
});