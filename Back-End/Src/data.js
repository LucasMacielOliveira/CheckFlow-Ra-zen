const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const HISTORICO_FILE = path.join(DATA_DIR, "historico.json");
const TAREFAS_FILE = path.join(DATA_DIR, "tarefas.json");
const TAREFAS_PADRAO_FILE = path.join(DATA_DIR, "tarefas-padrao.json");
const SOLICITACOES_FILE = path.join(DATA_DIR, "solicitacoes.json");

function garantirArquivo(caminho, conteudoInicial) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

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
  garantirArquivo(caminho, Array.isArray(dados) ? [] : {});
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
    "Apuração": []
  });
}

function lerSolicitacoes() {
  return lerJson(SOLICITACOES_FILE, []);
}

function salvarSolicitacoes(dados) {
  salvarJson(SOLICITACOES_FILE, dados);
}

module.exports = {
  lerHistorico,
  salvarHistorico,
  lerTarefas,
  salvarTarefas,
  lerTarefasPadrao,
  lerSolicitacoes,
  salvarSolicitacoes
};