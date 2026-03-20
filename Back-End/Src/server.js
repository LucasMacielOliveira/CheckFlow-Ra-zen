const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const caminhoHistorico = path.join(__dirname, "data", "historico.json");

function lerHistoricoArquivo() {
  try {
    const pastaData = path.join(__dirname, "data");

    if (!fs.existsSync(pastaData)) {
      fs.mkdirSync(pastaData, { recursive: true });
    }

    if (!fs.existsSync(caminhoHistorico)) {
      fs.writeFileSync(caminhoHistorico, JSON.stringify([], null, 2), "utf-8");
    }

    const conteudo = fs.readFileSync(caminhoHistorico, "utf-8");
    return JSON.parse(conteudo || "[]");
  } catch (erro) {
    console.error("Erro ao ler histórico:", erro);
    return [];
  }
}

function salvarHistoricoArquivo(lista) {
  fs.writeFileSync(caminhoHistorico, JSON.stringify(lista, null, 2), "utf-8");
}

// dados provisórios para filiais e tarefas

const filiaisPorEstado = {
  "São Paulo": ["Paulínia", "Campinas", "Piracicaba"],
  "Minas Gerais": ["Uberlândia", "Belo Horizonte"],
  "Paraná": ["Curitiba", "Londrina"],
  "Rio de Janeiro": ["Rio de Janeiro", "Campos"]
};

const tarefas = {
  "Apuração": {
    "São Paulo": {
      "Paulínia": [
        {
          titulo: "Conferir notas fiscais",
          instrucao: [
            "Acessar o sistema fiscal",
            "Validar notas emitidas",
            "Comparar com relatório do período"
          ]
        },
        {
          titulo: "Validar impostos",
          instrucao: [
            "Conferir alíquotas aplicadas",
            "Verificar base de cálculo",
            "Aprovar lançamento"
          ]
        }
      ]
    },
    "Minas Gerais": {
      geral: [
        {
          titulo: "Fechar apuração estadual",
          instrucao: [
            "Verificar lançamentos do período",
            "Conferir relatórios",
            "Encerrar a apuração"
          ]
        }
      ]
    }
  },
  "SPED": {
    "São Paulo": {
      geral: [
        {
          titulo: "Gerar arquivo SPED",
          instrucao: [
            "Abrir módulo SPED",
            "Selecionar período",
            "Gerar arquivo final"
          ]
        }
      ]
    }
  },
  "SCANC": {
    "São Paulo": {
      geral: [
        {
          titulo: "Validar movimentações SCANC",
          instrucao: [
            "Acessar relatório de movimentações",
            "Conferir inconsistências",
            "Registrar validação"
          ]
        }
      ]
    }
  }
};

// Rotas para dados de filiais e tarefas

app.get("/estados", (req, res) => {
  const estados = Object.keys(filiaisPorEstado);
  res.json(estados);
});

app.get("/filiais", (req, res) => {
  const { estado } = req.query;

  if (!estado) {
    return res.status(400).json({ erro: "Estado é obrigatório." });
  }

  const filiais = filiaisPorEstado[estado] || [];
  res.json(filiais);
});

app.get("/tarefas", (req, res) => {
  const { processo, estado, filial } = req.query;

  if (!processo || !estado) {
    return res.status(400).json({ erro: "Processo e estado são obrigatórios." });
  }

  const processoData = tarefas[processo];
  if (!processoData) {
    return res.json([]);
  }

  const estadoData = processoData[estado];
  if (!estadoData) {
    return res.json([]);
  }

  if (filial && estadoData[filial]) {
    return res.json(estadoData[filial]);
  }

  if (estadoData.geral) {
    return res.json(estadoData.geral);
  }

  res.json([]);
});

// Rotas para histórico de tarefas

app.get("/historico", (req, res) => { // Retorna o histórico completo
  const historico = lerHistoricoArquivo();
  res.json(historico);
});

app.post("/historico", (req, res) => {
  console.log("BODY RECEBIDO:", req.body);

  const novoRegistro = req.body;

  if (!novoRegistro || !novoRegistro.id) {
    return res.status(400).json({ erro: "Registro inválido." });
  }

  const historico = lerHistoricoArquivo();
  historico.unshift(novoRegistro);
  salvarHistoricoArquivo(historico);

  res.status(201).json({
    mensagem: "Histórico salvo com sucesso.",
    registro: novoRegistro
  });
});

app.delete("/historico/:id", (req, res) => { // Exclui um registro do histórico pelo ID
  const { id } = req.params;
  const historico = lerHistoricoArquivo();

  const atualizado = historico.filter((item) => String(item.id) !== String(id));

  if (atualizado.length === historico.length) { 
    return res.status(404).json({ erro: "Registro não encontrado." });
  }

  salvarHistoricoArquivo(atualizado);

  res.json({ mensagem: "Registro excluído com sucesso." });
});

app.delete("/historico", (req, res) => {
  salvarHistoricoArquivo([]);
  res.json({ mensagem: "Histórico limpo com sucesso." });
});

app.listen(PORT, () => { // Inicia o servidor
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});