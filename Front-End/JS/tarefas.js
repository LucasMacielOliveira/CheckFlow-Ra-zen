const tarefasConfig = {
  "Apuração": {
    geral: [
      {
        titulo: "Conferir notas fiscais",
        instrucao: [
          "Acesse o sistema fiscal.",
          "Filtre pela competência do mês.",
          "Compare com o relatório interno.",
          "Verifique divergências antes de concluir."
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
            "Valide documentos obrigatórios.",
            "Registre qualquer divergência."
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
      },
      {
        titulo: "Corrigir inconsistências",
        instrucao: [
          "Volte ao sistema.",
          "Ajuste os lançamentos incorretos.",
          "Gere o arquivo novamente, se necessário."
        ]
      },
      {
        titulo: "Transmitir arquivo",
        instrucao: [
          "Confirme que não há erros impeditivos.",
          "Realize a transmissão.",
          "Guarde o recibo."
        ]
      }
    ],
    porEstado: {
      "Minas Gerais": [
        {
          titulo: "Verificar exigência estadual de MG",
          instrucao: [
            "Confirme parâmetros específicos do estado.",
            "Valide consistência antes da entrega."
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
        titulo: "Conferir movimentações",
        instrucao: [
          "Revise entradas e saídas do período.",
          "Compare com os controles internos.",
          "Anote divergências."
        ]
      },
      {
        titulo: "Transmitir SCANC",
        instrucao: [
          "Confirme os dados.",
          "Realize a transmissão no sistema.",
          "Verifique a confirmação."
        ]
      },
      {
        titulo: "Salvar comprovante",
        instrucao: [
          "Baixe o comprovante de envio.",
          "Salve em local apropriado.",
          "Confirme o nome do arquivo."
        ]
      }
    ],
    porEstado: {},
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

function montarTarefasChecklist(processo, estados, filiais) {
  const config = tarefasConfig[processo];

  if (!config) {
    return [];
  }

  let tarefas = [...config.geral];

  estados.forEach(function (estado) {
    const tarefasEstado = config.porEstado[estado] || [];
    tarefas = tarefas.concat(tarefasEstado);
  });

  filiais.forEach(function (filial) {
    const tarefasFilial = config.porFilial[filial] || [];
    tarefas = tarefas.concat(tarefasFilial);
  });

  return tarefas;
}