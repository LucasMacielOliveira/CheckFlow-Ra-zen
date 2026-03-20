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

function lerHistoricoChecklists() {
  return lerLista("historicoChecklists");
}

function salvarHistoricoChecklists(lista) {
  salvarLista("historicoChecklists", lista);
}

function adicionarHistoricoChecklist(registro) {
  const historico = lerHistoricoChecklists();
  historico.unshift(registro);
  salvarHistoricoChecklists(historico);
}

function excluirHistoricoChecklist(id) {
  const historico = lerHistoricoChecklists();
  const atualizado = historico.filter(function (item) {
    return item.id !== id;
  });
  salvarHistoricoChecklists(atualizado);
}

function limparHistoricoChecklists() {
  removerItem("historicoChecklists");
}
