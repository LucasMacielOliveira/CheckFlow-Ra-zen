const pool = require("../db");

async function getDashboardSummary() {
  const totalChecklistsQuery = await pool.query(`
    SELECT COUNT(*)::int AS total
    FROM checklists
  `);

  const porProcessoQuery = await pool.query(`
    SELECT 
      processo,
      COUNT(*)::int AS total
    FROM checklists
    GROUP BY processo
    ORDER BY total DESC
  `);

  const porUsuarioQuery = await pool.query(`
    SELECT 
      usuario,
      COUNT(*)::int AS total
    FROM checklists
    GROUP BY usuario
    ORDER BY total DESC
  `);

  const porMesQuery = await pool.query(`
    SELECT 
      TO_CHAR(finalizado_em, 'YYYY-MM') AS mes,
      COUNT(*)::int AS total
    FROM checklists
    GROUP BY mes
    ORDER BY mes DESC
  `);

  const tarefasQuery = await pool.query(`
    SELECT
      COUNT(*)::int AS total_tarefas,
      COUNT(*) FILTER (WHERE concluida = true)::int AS tarefas_concluidas
    FROM checklist_tarefas
  `);

  const totalChecklists = totalChecklistsQuery.rows[0]?.total || 0;
  const totalTarefas = tarefasQuery.rows[0]?.total_tarefas || 0;
  const tarefasConcluidas = tarefasQuery.rows[0]?.tarefas_concluidas || 0;

  const taxaConclusao = totalTarefas
    ? Math.round((tarefasConcluidas / totalTarefas) * 100)
    : 0;

  return {
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