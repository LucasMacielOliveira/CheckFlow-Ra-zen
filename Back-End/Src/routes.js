const express = require("express");
const controllers = require("./controllers");

const router = express.Router();

// Health check
router.get("/", controllers.healthCheck);

// Auxiliares
router.get("/estados", controllers.getEstados);
router.get("/filiais", controllers.getFiliais);

// Checklist
router.get("/tarefas", controllers.getTarefas);

// Histórico
router.get("/historico", controllers.getHistorico);
router.post("/historico", controllers.postHistorico);
router.delete("/historico/:id", controllers.deleteHistoricoPorId);
router.delete("/historico", controllers.deleteHistorico);

// Solicitações
router.get("/solicitacoes", controllers.getSolicitacoes);
router.post("/solicitacoes", controllers.postSolicitacao);
router.patch("/solicitacoes/:id/status", controllers.patchSolicitacaoStatus);

// Admin - tarefas extras
router.get("/admin/tarefas", controllers.getAdminTarefas);
router.post("/admin/tarefas", controllers.postAdminTarefa);
router.put("/admin/tarefas/:id", controllers.putAdminTarefa);
router.delete("/admin/tarefas/:id", controllers.deleteAdminTarefa);

// Dashboard
router.get("/dashboard/resumo", controllers.getDashboard);


module.exports = router;