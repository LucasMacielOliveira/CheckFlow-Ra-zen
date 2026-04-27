const pool = require("../db");

async function saveHistory(registro) {
   
  console.log("ENTROU NO REPOSITORY");
  console.log("REGISTRO:", registro);

  const testeBanco = await pool.query("SELECT current_database()");
  console.log("BANCO USADO PELO NODE:", testeBanco.rows);

    const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const checklistResult = await client.query(
      `
      INSERT INTO checklists (processo, competencia, usuario, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        registro.processo,
        registro.competencia,
        registro.usuario,
        registro.status || "finalizado"
      ]
    );

    const checklist = checklistResult.rows[0];
    console.log("CHECKLIST INSERIDO:", checklist);

    for (const estado of registro.estados || []) {
      await client.query(
        `
        INSERT INTO checklist_estados (checklist_id, estado)
        VALUES ($1, $2)
        `,
        [checklist.id, estado]
      );
    }

    for (const filial of registro.filiais || []) {
      await client.query(
        `
        INSERT INTO checklist_filiais (checklist_id, filial)
        VALUES ($1, $2)
        `,
        [checklist.id, filial]
      );
    }

    for (const tarefa of registro.tarefas || []) {
      await client.query(
        `
        INSERT INTO checklist_tarefas (checklist_id, titulo, concluida)
        VALUES ($1, $2, $3)
        `,
        [checklist.id, tarefa.titulo, tarefa.concluida]
      );
    }

    await client.query("COMMIT");

    return checklist;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function findHistory(usuario = "") {
  const params = [];
  let filtroUsuario = "";

  if (usuario) {
    params.push(usuario);
    filtroUsuario = "WHERE LOWER(c.usuario) = LOWER($1)";
  }

  const result = await pool.query(
    `
    SELECT
      c.id,
      c.processo,
      c.competencia,
      c.usuario,
      c.status,
      c.finalizado_em AS "finalizadoEmIso",
      TO_CHAR(c.finalizado_em, 'DD/MM/YYYY, HH24:MI:SS') AS "finalizadoEm",

      COALESCE(
        JSON_AGG(DISTINCT ce.estado) FILTER (WHERE ce.estado IS NOT NULL),
        '[]'
      ) AS estados,

      COALESCE(
        JSON_AGG(DISTINCT cf.filial) FILTER (WHERE cf.filial IS NOT NULL),
        '[]'
      ) AS filiais,

      COALESCE(
        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT(
            'titulo', ct.titulo,
            'concluida', ct.concluida
          )
        ) FILTER (WHERE ct.id IS NOT NULL),
        '[]'
      ) AS tarefas,

      COUNT(DISTINCT ct.id)::int AS "totalTarefas",
      COUNT(DISTINCT ct.id) FILTER (WHERE ct.concluida = true)::int AS concluidas

    FROM checklists c
    LEFT JOIN checklist_estados ce
      ON ce.checklist_id = c.id
    LEFT JOIN checklist_filiais cf
      ON cf.checklist_id = c.id
    LEFT JOIN checklist_tarefas ct
      ON ct.checklist_id = c.id

    ${filtroUsuario}

    GROUP BY c.id
    ORDER BY c.finalizado_em DESC
    `,
    params
  );

  return result.rows;
}
module.exports = {
  saveHistory,
  findHistory
};