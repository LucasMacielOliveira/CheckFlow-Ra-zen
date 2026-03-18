function filtrarOpcoes(searchInputId, optionClass) {
  const termo = document.getElementById(searchInputId).value.toLowerCase();
  const opcoes = document.querySelectorAll("." + optionClass);

  opcoes.forEach(function(opcao) {
    const texto = opcao.textContent.toLowerCase();
    opcao.style.display = texto.includes(termo) ? "block" : "none";
  });
}

function toggleSelecionarTodos(masterId, checkboxClass, previewId, previewLabel) {
  const marcarTodos = document.getElementById(masterId).checked;
  const checkboxes = document.querySelectorAll("." + checkboxClass);

  checkboxes.forEach(function(checkbox) {
    checkbox.checked = marcarTodos;
  });

  atualizarPreview(checkboxClass, previewId, previewLabel, masterId);
}

function atualizarPreview(checkboxClass, previewId, previewLabel, masterId) {
  const checkboxes = document.querySelectorAll("." + checkboxClass + ":checked");
  const preview = document.getElementById(previewId);

  let selecionados = [];

  checkboxes.forEach(function(checkbox) {
    selecionados.push(checkbox.value);
  });

  if (selecionados.length === 0) {
    preview.innerHTML = "Nenhum item selecionado.";
  } else {
    preview.innerHTML = "<strong>" + previewLabel + ":</strong> " + selecionados.join(", ");
  }

  if (masterId) {
    const total = document.querySelectorAll("." + checkboxClass).length;
    document.getElementById(masterId).checked = selecionados.length === total;
  }
}

function obterSelecionados(checkboxClass) {
  const checkboxes = document.querySelectorAll("." + checkboxClass + ":checked");
  let selecionados = [];

  checkboxes.forEach(function(checkbox) {
    selecionados.push(checkbox.value);
  });

  return selecionados;
}