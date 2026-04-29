const pool = require("../db");

function montarFiltrosDashboard(filtros = {}) {
  const condicoes = [];
  const params = [];

  if (filtros.dataInicio) {
    params.push(filtros.dataInicio);
    condicoes.push(`c.finalizado_em::date >= $${params.length}`);
  }

  if (filtros.dataFim) {
    params.push(filtros.dataFim);
    condicoes.push(`c.finalizado_em::date <= $${params.length}`);
  }

  if (filtros.processo) {
    params.push(filtros.processo);
    condicoes.push(`c.processo = $${params.length}`);
  }

  if (filtros.usuario) {
    params.push(filtros.usuario);
    condicoes.push(`LOWER(c.usuario) = LOWER($${params.length})`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  return { where, params };
}

async function getDashboardSummary(filtros = {}) {
  const { where, params } = montarFiltrosDashboard(filtros);

  const totalChecklistsQuery = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM checklists c
    ${where}
    `,
    params
  );

  const porProcessoQuery = await pool.query(
    `
    SELECT 
      c.processo,
      COUNT(*)::int AS total
    FROM checklists c
    ${where}
    GROUP BY c.processo
    ORDER BY total DESC
    `,
    params
  );

  const porUsuarioQuery = await pool.query(
    `
    SELECT 
      c.usuario,
      COUNT(*)::int AS total
    FROM checklists c
    ${where}
    GROUP BY c.usuario
    ORDER BY total DESC
    `,
    params
  );

  const porMesQuery = await pool.query(
    `
    SELECT 
      TO_CHAR(c.finalizado_em, 'YYYY-MM') AS mes,
      COUNT(*)::int AS total
    FROM checklists c
    ${where}
    GROUP BY mes
    ORDER BY mes DESC
    `,
    params
  );

  const tarefasQuery = await pool.query(
    `
    SELECT
      COUNT(ct.id)::int AS total_tarefas,
      COUNT(ct.id) FILTER (WHERE ct.concluida = true)::int AS tarefas_concluidas
    FROM checklists c
    LEFT JOIN checklist_tarefas ct
      ON ct.checklist_id = c.id
    ${where}
    `,
    params
  );

  const totalChecklists = totalChecklistsQuery.rows[0]?.total || 0;
  const totalTarefas = tarefasQuery.rows[0]?.total_tarefas || 0;
  const tarefasConcluidas = tarefasQuery.rows[0]?.tarefas_concluidas || 0;

  const taxaConclusao = totalTarefas
    ? Math.round((tarefasConcluidas / totalTarefas) * 100)
    : 0;

  return {
    filtrosAplicados: filtros,
    totalChecklists,
    totalTarefas,
    tarefasConcluidas,
    taxaConclusao,
    porProcesso: porProcessoQuery.rows,
    porUsuario: porUsuarioQuery.rows,
    porMes: porMesQuery.rows
  };
}

module.exports = {
  getDashboardSummary
};