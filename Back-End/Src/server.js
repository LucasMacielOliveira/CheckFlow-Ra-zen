const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const estadosFiliais = {
  "SP": ["Paulínia", "Campinas", "Ribeirão Preto", "Santos"],
  "MG": ["Belo Horizonte", "Uberlândia"],
  "PR": ["Curitiba", "Londrina"],
  "RJ": ["Rio de Janeiro", "Duque de Caxias"]
};

const tarefasConfig = {
  "Apuração": {
    geral: [
      {
        titulo: "Conferir notas fiscais",
        instrucao: [
          "Acesse o sistema fiscal.",
          "Filtre pela competência do mês.",
          "Compare com o relatório interno."
        ]
      },
      {
        titulo: "Validar relatórios",
        instrucao: [
          "Abra o relatório mensal.",
          "Revise os valores principais.",
          "Compare com os dados lançados no sistema."
        ]
      }
    ],
    porEstado: {
      "São Paulo": [
        {
          titulo: "Validar regra estadual de São Paulo",
          instrucao: [
            "Confira exigências específicas do estado.",
            "Valide documentos obrigatórios."
          ]
        }
      ]
    },
    porFilial: {
      "Paulínia": [
        {
          titulo: "Conferir rotina local de Paulínia",
          instrucao: [
            "Verifique o procedimento interno da filial.",
            "Confirme o checklist operacional local."
          ]
        }
      ]
    }
  },

  "SPED": {
    geral: [
      {
        titulo: "Gerar arquivo SPED",
        instrucao: [
          "Acesse o módulo do SPED.",
          "Selecione a competência correta.",
          "Gere o arquivo para validação."
        ]
      },
      {
        titulo: "Validar no PVA",
        instrucao: [
          "Abra o programa validador.",
          "Importe o arquivo gerado.",
          "Analise os erros e avisos."
        ]
      }
    ],
    porEstado: {
      "São Paulo": [
        {
          titulo: "Validar entrega estadual SP",
          instrucao: [
            "Conferir regras estaduais.",
            "Validar consistência do arquivo."
          ]
        }
      ]
    },
    porFilial: {}
  },

  "SCANC": {
    geral: [
      {
        titulo: "Validar arquivo SCANC",
        instrucao: [
          "Acesse o sistema SCANC.",
          "Selecione a competência.",
          "Valide os dados do arquivo."
        ]
      },
      {
        titulo: "Transmitir SCANC",
        instrucao: [
          "Confirme os dados.",
          "Realize a transmissão no sistema."
        ]
      }
    ],
    porEstado: {
      "São Paulo": [
        {
          titulo: "Conferir regra estadual SCANC",
          instrucao: [
            "Validar lançamentos do estado.",
            "Confirmar consistência documental."
          ]
        }
      ]
    },
    porFilial: {
      "Campinas": [
        {
          titulo: "Conferir ajuste local de Campinas",
          instrucao: [
            "Verifique a operação local da filial.",
            "Confirme dados internos antes do envio."
          ]
        }
      ]
    }
  }
};

function montarTarefasChecklist(processo, estado, filial) {
  const config = tarefasConfig[processo];

  if (!config) {
    return [];
  }

  let tarefas = [...config.geral];

  if (estado && config.porEstado[estado]) {
    tarefas = tarefas.concat(config.porEstado[estado]);
  }

  if (filial && config.porFilial[filial]) {
    tarefas = tarefas.concat(config.porFilial[filial]);
  }

  return tarefas;
}

app.get("/", (req, res) => {
  res.send("CheckFlow API rodando 🚀");
});

app.get("/estados", (req, res) => {
  res.json(Object.keys(estadosFiliais));
});

app.get("/filiais", (req, res) => {
  const estado = req.query.estado;

  if (!estado) {
    return res.status(400).json({ erro: "Informe o estado" });
  }

  const filiais = estadosFiliais[estado] || [];
  res.json(filiais);
});

app.get("/tarefas", (req, res) => {
  const { processo, estado, filial } = req.query;

  if (!processo) {
    return res.status(400).json({ erro: "Informe o processo" });
  }

  const tarefas = montarTarefasChecklist(processo, estado, filial);
  res.json(tarefas);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});