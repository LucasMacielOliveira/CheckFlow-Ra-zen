CREATE TABLE checklists (
  id SERIAL PRIMARY KEY,
  processo VARCHAR(50) NOT NULL,
  competencia VARCHAR(20) NOT NULL,
  usuario VARCHAR(120) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'finalizado',
  finalizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist_tarefas (
  id SERIAL PRIMARY KEY,
  checklist_id INT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE checklist_estados (
  id SERIAL PRIMARY KEY,
  checklist_id INT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  estado VARCHAR(80) NOT NULL
);

CREATE TABLE checklist_filiais (
  id SERIAL PRIMARY KEY,
  checklist_id INT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  filial VARCHAR(120) NOT NULL
);