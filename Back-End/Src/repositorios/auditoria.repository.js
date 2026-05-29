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

async function listarAuditoria(filtros = {}) {
  const condicoes = [];
  const params = [];

  if (filtros.usuario) {
    params.push(`%${filtros.usuario}%`);
    condicoes.push(`LOWER(usuario_nome) LIKE LOWER($${params.length})`);
  }

  if (filtros.acao) {
    params.push(filtros.acao);
    condicoes.push(`acao = $${params.length}`);
  }

  if (filtros.dataInicio) {
    params.push(filtros.dataInicio);
    condicoes.push(`criado_em::date >= $${params.length}`);
  }

  if (filtros.dataFim) {
    params.push(filtros.dataFim);
    condicoes.push(`criado_em::date <= $${params.length}`);
  }

  const where = condicoes.length
    ? `WHERE ${condicoes.join(" AND ")}`
    : "";

  const result = await pool.query(
    `
    SELECT
      id,
      usuario_id,
      usuario_nome,
      acao,
      entidade,
      detalhes,
      criado_em
    FROM logs_auditoria
    ${where}
    ORDER BY criado_em DESC
    LIMIT 200
    `,
    params
  );

  return result.rows;
}

module.exports = {
  registrarAuditoria,
  listarAuditoria
};