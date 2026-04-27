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

module.exports = {
  saveHistory
};