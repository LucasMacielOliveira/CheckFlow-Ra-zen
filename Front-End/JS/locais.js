const estadosFiliais = {
  "São Paulo": ["Paulínia", "Campinas", "Ribeirão Preto", "Santos"],
  "Minas Gerais": ["Belo Horizonte", "Uberlândia"],
  "Paraná": ["Curitiba", "Londrina"],
  "Rio de Janeiro": ["Rio de Janeiro", "Duque de Caxias"]
};

function obterEstados() {
  return Object.keys(estadosFiliais);
}

function obterFiliaisPorEstados(estadosSelecionados) {
  const filiais = [];

  estadosSelecionados.forEach(function (estado) {
    const lista = estadosFiliais[estado] || [];

    lista.forEach(function (filial) {
      if (!filiais.includes(filial)) {
        filiais.push(filial);
      }
    });
  });

  return filiais.sort();
}