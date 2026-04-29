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

async function fazerLogin() {
  const usuario = document.getElementById("usuario")?.value.trim();
  const senha = document.getElementById("senha")?.value.trim();

  if (!usuario) {
    alert("Digite o usuário.");
    return;
  }

  if (!senha) {
    alert("Digite a senha.");
    return;
  }

  try {
    const usuarioAutenticado = await request("/login", {
      method: "POST",
      body: JSON.stringify({
        usuario,
        senha
      })
    });

    salvarTexto("usuarioLogado", usuarioAutenticado.nome);
    salvarTexto("usuarioSistema", usuarioAutenticado.usuario);
    salvarTexto("perfilUsuario", usuarioAutenticado.perfil);
    salvarTexto("areaSelecionada", usuarioAutenticado.area);
    salvarTexto("usuarioId", usuarioAutenticado.id);

    window.location.href = "area.html";
  } catch (erro) {
    alert(erro?.message || "Erro ao fazer login.");
  }
}

function salvarUsuarioLogado(usuario) {
  localStorage.setItem("usuarioLogado", usuario.nome);
  localStorage.setItem("perfilUsuario", usuario.perfil);
  localStorage.setItem("areaSelecionada", usuario.area);
  localStorage.setItem("usuarioId", usuario.id);
}


function exigirLogin() {
  const usuario = localStorage.getItem ("usuarioLogado");

  if(!usuario){
    window.location.href = "index.html";
    return false;
  }

  return true;
}