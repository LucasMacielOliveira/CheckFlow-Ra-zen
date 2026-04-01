function salvarTexto(chave, valor) {
  localStorage.setItem(chave, String(valor ?? ""));
}

function lerTexto(chave) {
  return localStorage.getItem(chave);
}

function salvarLista(chave, valor) {
  const lista = Array.isArray(valor) ? valor : [];
  localStorage.setItem(chave, JSON.stringify(lista));
}

function lerLista(chave) {
  const valor = localStorage.getItem(chave);

  try {
    return valor ? JSON.parse(valor) : [];
  } catch {
    return [];
  }
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

function obterUsuarioLogado() {
  return lerTexto("usuarioLogado");
}

function obterPerfilUsuario() {
  return lerTexto("perfilUsuario");
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

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}