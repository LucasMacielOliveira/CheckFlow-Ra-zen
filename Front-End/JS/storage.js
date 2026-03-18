function salvarTexto(chave, valor) {
  localStorage.setItem(chave, valor);
}

function lerTexto(chave) {
  return localStorage.getItem(chave);
}

function salvarLista(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function lerLista(chave) {
  const valor = localStorage.getItem(chave);
  return valor ? JSON.parse(valor) : [];
}

function removerItem(chave) {
  localStorage.removeItem(chave);
}

function limparFluxo() {
  removerItem("processoSelecionado");
  removerItem("estadosSelecionados");
  removerItem("filiaisSelecionadas");
  removerItem("competenciaSelecionada");
}