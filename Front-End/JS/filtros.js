function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filtrarOpcoes(searchInputId, optionClass) {
  const termo = normalizarTexto(document.getElementById(searchInputId).value);
  const opcoes = document.querySelectorAll("." + optionClass);

  opcoes.forEach(function (opcao) {
    const texto = normalizarTexto(opcao.textContent);
    opcao.style.display = texto.includes(termo) ? "block" : "none";
  });
}

function toggleSelecionarTodos(masterId, checkboxClass, previewId, previewLabel) {
  const marcarTodos = document.getElementById(masterId).checked;
  const checkboxes = document.querySelectorAll("." + checkboxClass);

  checkboxes.forEach(function (checkbox) {
    checkbox.checked = marcarTodos;
  });

  atualizarPreview(checkboxClass, previewId, previewLabel, masterId);
}

function atualizarPreview(checkboxClass, previewId, previewLabel, masterId) {
  const checkboxesMarcados = document.querySelectorAll("." + checkboxClass + ":checked");
  const preview = document.getElementById(previewId);

  let selecionados = [];

  checkboxesMarcados.forEach(function (checkbox) {
    selecionados.push(checkbox.value);
  });

  if (selecionados.length === 0) {
    preview.innerHTML = "Nenhum item selecionado.";
  } else {
    preview.innerHTML =
      "<strong>" + previewLabel + " (" + selecionados.length + "):</strong> " +
      selecionados.join(", ");
  }

  if (masterId) {
    const total = document.querySelectorAll("." + checkboxClass).length;
    const master = document.getElementById(masterId);

    if (master) {
      master.checked = selecionados.length === total && total > 0;
    }
  }
}

function obterSelecionados(checkboxClass) {
  const checkboxes = document.querySelectorAll("." + checkboxClass + ":checked");
  let selecionados = [];

  checkboxes.forEach(function (checkbox) {
    selecionados.push(checkbox.value);
  });

  return selecionados;
}

function renderizarOpcoes(
  containerId,
  items,
  checkboxClass,
  optionClass,
  previewId,
  previewLabel,
  masterId
) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  let html = `
    <label class="option-item">
      <input
        type="checkbox"
        id="${masterId}"
        onclick="toggleSelecionarTodos('${masterId}', '${checkboxClass}', '${previewId}', '${previewLabel}')"
      >
      Selecionar todos
    </label>
  `;

  items.forEach(function (item) {
    html += `
      <label class="option-item ${optionClass}">
        <input
          type="checkbox"
          class="${checkboxClass}"
          value="${item}"
          onchange="atualizarPreview('${checkboxClass}', '${previewId}', '${previewLabel}', '${masterId}')"
        >
        ${item}
      </label>
    `;
  });

  container.innerHTML = html;
}