const pool = require("../db");

async function listarUsuarios() {
  const result = await pool.query(`
    SELECT
      u.id,
      u.nome,
      u.usuario,
      u.perfil,
      u.ativo,
      u.area_id AS "areaId",
      a.nome AS area,
      u.criado_em AS "criadoEm"
    FROM usuarios u
    LEFT JOIN areas a ON a.id = u.area_id
    ORDER BY u.nome ASC
  `);

  return result.rows;
}

async function criarUsuario(dados) {
  const result = await pool.query(
    `
    INSERT INTO usuarios (nome, usuario, senha, perfil, area_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, nome, usuario, perfil, ativo, area_id AS "areaId"
    `,
    [dados.nome, dados.usuario, dados.senha, dados.perfil, dados.areaId]
  );

  return result.rows[0];
}

async function atualizarUsuario(id, dados) {
  const result = await pool.query(
    `
    UPDATE usuarios
    SET nome = $1,
        usuario = $2,
        perfil = $3,
        area_id = $4
    WHERE id = $5
    RETURNING id, nome, usuario, perfil, ativo, area_id AS "areaId"
    `,
    [dados.nome, dados.usuario, dados.perfil, dados.areaId, id]
  );

  return result.rows[0] || null;
}

async function alterarStatusUsuario(id, ativo) {
  const result = await pool.query(
    `
    UPDATE usuarios
    SET ativo = $1
    WHERE id = $2
    RETURNING id, nome, usuario, perfil, ativo
    `,
    [ativo, id]
  );

  return result.rows[0] || null;
}

async function listarAreas() {
  const result = await pool.query(`
    SELECT id, nome, ativo
    FROM areas
    WHERE ativo = true
    ORDER BY nome ASC
  `);

  return result.rows;
}

module.exports = {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  alterarStatusUsuario,
  listarAreas
};