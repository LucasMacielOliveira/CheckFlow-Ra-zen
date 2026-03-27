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

function mostrarToast(mensagem, tipo = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}