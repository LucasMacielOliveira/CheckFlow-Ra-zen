const pool = require("../db");

async function registrarAuditoria({
  usuarioId,
  usuarioNome,
  acao,
  entidade,
  detalhes
}) {

  await pool.query(
    `
    INSERT INTO logs_auditoria (
      usuario_id,
      usuario_nome,
      acao,
      entidade,
      detalhes
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      usuarioId,
      usuarioNome,
      acao,
      entidade,
      detalhes
    ]
  );
}

async function listarAuditoria() {

  const result = await pool.query(`
    SELECT *
    FROM logs_auditoria
    ORDER BY criado_em DESC
    LIMIT 200
  `);

  return result.rows;
}

module.exports = {
  registrarAuditoria,
  listarAuditoria
};