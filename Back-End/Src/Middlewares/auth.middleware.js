const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      erro: "Token não informado."
    });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({
      erro: "Token inválido."
    });
  }

  try {
    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = usuario;

    return next();

  } catch (error) {
    return res.status(401).json({
      erro: "Token expirado ou inválido."
    });
  }
}

function exigirAdmin(req, res, next) {
  if (req.usuario?.perfil !== "admin") {
    return res.status(403).json({
      erro: "Acesso restrito a administradores."
    });
  }

  return next();
}

module.exports = {
  autenticar,
  exigirAdmin
};