const pool = require("../db");

async function findUserByUsername(usuario) {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.nome,
      u.usuario,
      u.senha,
      u.perfil,
      u.ativo,
      u.area_id AS "areaId",
      a.nome AS area
    FROM usuarios u
    LEFT JOIN areas a
      ON a.id = u.area_id
    WHERE u.usuario = $1
    LIMIT 1
    `,
    [usuario]
  );

  return result.rows[0] || null;
}

module.exports = {
  findUserByUsername
};