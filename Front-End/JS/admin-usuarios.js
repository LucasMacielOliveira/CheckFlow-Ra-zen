let usuariosCache = [];
let areasCache = [];

function obterElemento(id) {
  return document.getElementById(id);
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function buscarAreasAdmin() {
  return request("/areas");
}

async function buscarUsuariosAdmin() {
  return request("/admin/usuarios");
}

async function criarUsuarioAdmin(dados) {
  return request("/admin/usuarios", {
    method: "POST",
    body: JSON.stringify(dados)
  });
}

async function atualizarUsuarioAdmin(id, dados) {
  return request(`/admin/usuarios/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(dados)
  });
}

async function alterarStatusUsuarioAdmin(id, ativo) {
  return request(`/admin/usuarios/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ ativo })
  });
}

function validarAcessoAdminUsuarios() {
  if (!exigirLogin()) {
    return false;
  }

  const perfil = lerTexto("perfilUsuario");

  if (perfil !== "admin") {
    alert("Acesso restrito a administradores.");
    window.location.href = "processo.html";
    return false;
  }

  return true;
}

function renderizarAreas() {
  const select = obterElemento("areaUsuario");
  if (!select) return;

  select.innerHTML = `<option value="">Selecione uma área</option>`;

  areasCache.forEach((area) => {
    select.innerHTML += `
      <option value="${escaparHtml(area.id)}">
        ${escaparHtml(area.nome)}
      </option>
    `;
  });
}

function coletarDadosUsuario() {
  const id = obterElemento("usuarioId")?.value || "";
  const nome = obterElemento("nomeUsuario")?.value.trim() || "";
  const usuario = obterElemento("loginUsuario")?.value.trim() || "";
  const senha = obterElemento("senhaUsuario")?.value.trim() || "";
  const perfil = obterElemento("perfilUsuarioForm")?.value || "analista";
  const areaId = Number(obterElemento("areaUsuario")?.value);

  if (!nome) {
    throw new Error("Informe o nome.");
  }

  if (!usuario) {
    throw new Error("Informe o usuário.");
  }

  if (!id && !senha) {
    throw new Error("Informe a senha.");
  }

  if (!perfil) {
    throw new Error("Selecione o perfil.");
  }

  if (!areaId) {
    throw new Error("Selecione a área.");
  }

  return {
    id,
    nome,
    usuario,
    senha,
    perfil,
    areaId
  };
}

function limparFormularioUsuario() {
  obterElemento("usuarioId").value = "";
  obterElemento("nomeUsuario").value = "";
  obterElemento("loginUsuario").value = "";
  obterElemento("senhaUsuario").value = "";
  obterElemento("perfilUsuarioForm").value = "analista";
  obterElemento("areaUsuario").value = "";

  const btnCancelar = obterElemento("btnCancelarUsuario");
  if (btnCancelar) {
    btnCancelar.style.display = "none";
  }

  const senhaInput = obterElemento("senhaUsuario");
  if (senhaInput) {
    senhaInput.placeholder = "Informe a senha";
  }
}

async function salvarUsuarioAdmin() {
  try {
    const dados = coletarDadosUsuario();

    if (dados.id) {
      await atualizarUsuarioAdmin(dados.id, dados);
      alert("Usuário atualizado com sucesso.");
    } else {
      await criarUsuarioAdmin(dados);
      alert("Usuário criado com sucesso.");
    }

    limparFormularioUsuario();
    await carregarUsuariosAdmin();
  } catch (erro) {
    alert(erro?.message || "Erro ao salvar usuário.");
  }
}

function editarUsuario(id) {
  const usuario = usuariosCache.find((item) => String(item.id) === String(id));

  if (!usuario) {
    alert("Usuário não encontrado.");
    return;
  }

  obterElemento("usuarioId").value = usuario.id;
  obterElemento("nomeUsuario").value = usuario.nome || "";
  obterElemento("loginUsuario").value = usuario.usuario || "";
  obterElemento("senhaUsuario").value = "";
  obterElemento("perfilUsuarioForm").value = usuario.perfil || "analista";
  obterElemento("areaUsuario").value = usuario.areaId || "";

  const senhaInput = obterElemento("senhaUsuario");
  if (senhaInput) {
    senhaInput.placeholder = "Deixe vazio para manter a senha atual";
  }

  const btnCancelar = obterElemento("btnCancelarUsuario");
  if (btnCancelar) {
    btnCancelar.style.display = "inline-flex";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function alternarStatusUsuario(id, ativoAtual) {
  try {
    const novoStatus = !ativoAtual;

    await alterarStatusUsuarioAdmin(id, novoStatus);

    alert(novoStatus ? "Usuário ativado." : "Usuário desativado.");
    await carregarUsuariosAdmin();
  } catch (erro) {
    alert(erro?.message || "Erro ao alterar status do usuário.");
  }
}

function renderizarUsuarios() {
  const container = obterElemento("listaUsuarios");
  if (!container) return;

  if (!Array.isArray(usuariosCache) || !usuariosCache.length) {
    container.innerHTML = `<div class="empty-state">Nenhum usuário cadastrado.</div>`;
    return;
  }

  container.innerHTML = usuariosCache
    .map((usuario) => {
      const ativo = Boolean(usuario.ativo);
      const statusClasse = ativo ? "finalizado" : "pendente";
      const statusTexto = ativo ? "Ativo" : "Inativo";

      return `
        <div class="history-card">
          <div class="history-card-header">
            <div>
              <h3>${escaparHtml(usuario.nome)}</h3>
              <p><strong>Usuário:</strong> ${escaparHtml(usuario.usuario)}</p>
            </div>

            <span class="status-badge ${statusClasse}">
              ${statusTexto}
            </span>
          </div>

          <div class="history-card-body">
            <p><strong>Perfil:</strong> ${escaparHtml(usuario.perfil || "-")}</p>
            <p><strong>Área:</strong> ${escaparHtml(usuario.area || "-")}</p>
          </div>

          <div class="history-card-actions">
            <button
              class="button secondary"
              type="button"
              onclick="editarUsuario('${escaparHtml(usuario.id)}')"
            >
              Editar
            </button>

            <button
              class="button danger"
              type="button"
              onclick="alternarStatusUsuario('${escaparHtml(usuario.id)}', ${ativo})"
            >
              ${ativo ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

async function carregarAreasAdmin() {
  try {
    areasCache = await buscarAreasAdmin();

    if (!Array.isArray(areasCache)) {
      areasCache = [];
    }

    renderizarAreas();
  } catch (erro) {
    console.error("Erro ao carregar áreas:", erro);
    alert("Erro ao carregar áreas.");
  }
}

async function carregarUsuariosAdmin() {
  const container = obterElemento("listaUsuarios");

  try {
    if (container) {
      container.innerHTML = `<div class="empty-state">Carregando usuários...</div>`;
    }

    usuariosCache = await buscarUsuariosAdmin();

    if (!Array.isArray(usuariosCache)) {
      usuariosCache = [];
    }

    renderizarUsuarios();
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);

    if (container) {
      container.innerHTML = `<div class="empty-state">Erro ao carregar usuários.</div>`;
    }
  }
}

function voltarAdmin() {
  window.location.href = "admin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!validarAcessoAdminUsuarios()) {
    return;
  }

  await carregarAreasAdmin();
  await carregarUsuariosAdmin();
});