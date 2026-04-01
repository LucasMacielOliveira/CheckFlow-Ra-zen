function exigirLogin() {
  const usuario = obterUsuarioLogado();

  if (!usuario || usuario.trim() === "") {
    alert("Você precisa fazer login para acessar esta página.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

function exigirArea() {
  const area = lerTexto("areaSelecionada");

  if (!area || area.trim() === "") {
    alert("Selecione uma área antes de continuar.");
    window.location.href = "area.html";
    return false;
  }

  return true;
}

function exigirProcesso() {
  const processo = lerTexto("processoSelecionado");

  if (!processo || processo.trim() === "") {
    alert("Selecione um processo antes de continuar.");
    window.location.href = "processo.html";
    return false;
  }

  return true;
}

function exigirAdmin() {
  const perfil = obterPerfilUsuario();

  if (perfil !== "admin") {
    alert("Acesso negado. Esta página é restrita a administradores.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}