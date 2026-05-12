const bcrypt = require("bcrypt");

async function gerarHash() {
  const senha = "Mobilidade2026";
  const hash = await bcrypt.hash(senha, 10);

  console.log(hash);
}

gerarHash();