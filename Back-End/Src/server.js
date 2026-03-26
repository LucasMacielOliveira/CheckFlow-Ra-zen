const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

/*  CONFIG  */

app.use(cors());
app.use(express.json());

/*  CAMINHOS  */

const pastaData = path.join(__dirname, "data");

const caminhoHistorico = path.join(pastaData, "historico.json");
const caminhoTarefas = path.join(pastaData, "tarefas.json");


const caminhoTarefasPadrao = path.join(pastaData, "tarefas-padrao.json");

function lerTarefasPadrao() {
  if (!fs.existsSync(caminhoTarefasPadrao)) {
    fs.writeFileSync(caminhoTarefasPadrao, JSON.stringify({}, null, 2));
  }

  return JSON.parse(fs.readFileSync(caminhoTarefasPadrao, "utf-8"));
}
/*  UTILS  */

function garantirArquivo(caminho) {
  if (!fs.existsSync(pastaData)) {
    fs.mkdirSync(pastaData, { recursive: true });
  }

  if (!fs.existsSync(caminho)) {
    fs.writeFileSync(caminho, JSON.stringify([], null, 2), "utf-8");
  }
}

/*  HISTÓRICO  */

function lerHistorico() {
  garantirArquivo(caminhoHistorico);
  return JSON.parse(fs.readFileSync(caminhoHistorico, "utf-8"));
}

function salvarHistorico(lista) {
  fs.writeFileSync(caminhoHistorico, JSON.stringify(lista, null, 2));
}

/*  TAREFAS  */

function lerTarefas() {
  garantirArquivo(caminhoTarefas);
  return JSON.parse(fs.readFileSync(caminhoTarefas, "utf-8"));
}

function salvarTarefas(lista) {
  fs.writeFileSync(caminhoTarefas, JSON.stringify(lista, null, 2));
}

/*  DADOS FIXOS  */

const filiaisPorEstado = {
  "São Paulo": ["Paulínia", "Campinas", "Piracicaba"],
  "Minas Gerais": ["Uberlândia", "Belo Horizonte"],
  "Paraná": ["Curitiba", "Londrina"],
  "Rio de Janeiro": ["Rio de Janeiro", "Campos"]
};

/*  ROTAS PADRÃO  */

app.get("/estados", (req, res) => {
  res.json(Object.keys(filiaisPorEstado));
});

app.get("/filiais", (req, res) => {
  const { estado } = req.query;

  if (!estado) {
    return res.status(400).json({ erro: "Estado é obrigatório." });
  }

  res.json(filiaisPorEstado[estado] || []);
});

/*  TAREFAS (USO NORMAL)  */

app.get("/tarefas", (req, res) => {
  const { processo, estado, filial } = req.query;

  if (!processo) {
    return res.status(400).json({ erro: "Processo é obrigatório." });
  }

  const tarefasPadrao = lerTarefasPadrao();
  const tarefasExtras = lerTarefas();

  const padrao = tarefasPadrao[processo] || [];
  let extras = [];

  if (processo === "SPED") {
    extras = tarefasExtras.filter((t) => {
      return t.processo === processo && t.estado === estado;
    });
  }

  if (processo === "SCANC" || processo === "Apuração") {
    extras = tarefasExtras.filter((t) => {
      return t.processo === processo && t.filial === filial;
    });
  }

  const todas = [...padrao, ...extras];

  const unicas = [];
  const idsJaAdicionados = new Set();

  todas.forEach((tarefa) => {
    const chave = tarefa.id
      ? String(tarefa.id)
      : `${tarefa.processo || ""}-${tarefa.estado || ""}-${tarefa.filial || ""}-${tarefa.titulo || ""}`;

    if (!idsJaAdicionados.has(chave)) {
      idsJaAdicionados.add(chave);
      unicas.push(tarefa);
    }
  });

  res.json(unicas);
});


/*  HISTÓRICO  */

app.get("/historico", (req, res) => {
  res.json(lerHistorico());
});

app.post("/historico", (req, res) => {
  const novo = req.body;

  if (!novo || !novo.id) {
    return res.status(400).json({ erro: "Registro inválido." });
  }

  const historico = lerHistorico();
  historico.unshift(novo);

  salvarHistorico(historico);

  res.status(201).json(novo);
});

app.delete("/historico/:id", (req, res) => {
  const { id } = req.params;

  let historico = lerHistorico();
  historico = historico.filter(h => String(h.id) !== String(id));

  salvarHistorico(historico);

  res.json({ mensagem: "Registro excluído" });
});

app.delete("/historico", (req, res) => {
  salvarHistorico([]);
  res.json({ mensagem: "Histórico limpo" });
});

/*  ADMIN - TAREFAS  */

app.get("/admin/tarefas", (req, res) => {
  res.json(lerTarefas());
});

app.post("/admin/tarefas", (req, res) => {
  const nova = req.body;

  if (!nova || !nova.titulo) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  const tarefas = lerTarefas();

  nova.id = String(Date.now());

  tarefas.push(nova);

  salvarTarefas(tarefas);

  res.status(201).json(nova);
});

app.delete("/admin/tarefas/:id", (req, res) => {
  const { id } = req.params;

  let tarefas = lerTarefas();
  tarefas = tarefas.filter(t => String(t.id) !== String(id));

  salvarTarefas(tarefas);

  res.json({ mensagem: "Tarefa excluída" });
});

app.put("/admin/tarefas/:id", (req, res) => {
  const { id } = req.params;
  const dadosAtualizados = req.body;

  if (!dadosAtualizados || !dadosAtualizados.titulo) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  const tarefas = lerTarefas();
  const indice = tarefas.findIndex((t) => String(t.id) === String(id));

  if (indice === -1) {
    return res.status(404).json({ erro: "Tarefa não encontrada" });
  }

  tarefas[indice] = {
    ...tarefas[indice],
    ...dadosAtualizados,
    id: tarefas[indice].id
  };

  salvarTarefas(tarefas);

  res.json(tarefas[indice]);
});
/*  START  */

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});