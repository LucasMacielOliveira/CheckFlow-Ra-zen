document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin()) return;

  iniciarPagina();
});

const processosConfig = {
  "Apuração": {
    usaEstado: true,
    usaFilial: true
  },
  "SPED": {
    usaEstado: true,
    usaFilial: false
  },
  "SCANC": {
    usaEstado: true,
    usaFilial: true
  }
};