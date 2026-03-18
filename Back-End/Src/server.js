const express = require('express');
const cors = require('cors');   

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("API DO CHECK FLOW ESTÁ RODANDO!")
});


app.get("/processos", (req, res) => {
    
    const processos = ["Apuração", "SPED", "SCANC"];
    
    res.json(processos);
});

app.get("/estados", (req, res) => {
    
    const estados = [
        "São Paulo", 
        "Rio de Janeiro", 
        "Minas Gerais"];
    
        res.json(estados);
});

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

app.get("/filiais", (req, res) => {
  const estado = req.query.estado;

  const estadosFiliais = {
    "São Paulo": ["Paulínia", "Campinas", "Ribeirão Preto", "Santos"],
    "Minas Gerais": ["Belo Horizonte", "Uberlândia"],
    "Paraná": ["Curitiba", "Londrina"],
    "Rio de Janeiro": ["Rio de Janeiro", "Duque de Caxias"]
  };

  if (!estado) {
    return res.status(400).json({ erro: "Informe o estado" });
  }

  const estadoBuscado = normalizarTexto(decodeURIComponent(estado));

  const chaveEncontrada = Object.keys(estadosFiliais).find(function(chave) {
    return normalizarTexto(chave) === estadoBuscado;
  });

  if (!chaveEncontrada) {
    return res.json([]);
  }

  res.json(estadosFiliais[chaveEncontrada]);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});