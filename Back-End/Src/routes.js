const express = require("express");
const controllers = require("./controllers");

const {
  autenticarToken,
  exigirAdmin
} = require("./Middlewares/auth.middlewares");

const router = express.Router();

// Health check
router.get("/", controllers.healthCheck);

// Auth
router.post("/login", controllers.login);

// Rotas protegidas
router.get("/estados", autenticarToken, controllers.getEstados);
router.get("/filiais", autenticarToken, controllers.getFiliais);

router.get("/tarefas", autenticarToken, controllers.getTarefas);

router.get("/historico", autenticarToken, controllers.getHistorico);
router.post("/historico", autenticarToken, controllers.postHistorico);
router.delete("/historico/:id", autenticarToken, exigirAdmin, controllers.deleteHistoricoPorId);
router.delete("/historico", autenticarToken, exigirAdmin, controllers.deleteHistorico);

router.get("/solicitacoes", autenticarToken, controllers.getSolicitacoes);
router.post("/solicitacoes", autenticarToken, controllers.postSolicitacao);
router.patch("/solicitacoes/:id/status", autenticarToken, exigirAdmin, controllers.patchSolicitacaoStatus);

router.get("/admin/tarefas", autenticarToken, exigirAdmin, controllers.getAdminTarefas);
router.post("/admin/tarefas", autenticarToken, exigirAdmin, controllers.postAdminTarefa);
router.put("/admin/tarefas/:id", autenticarToken, exigirAdmin, controllers.putAdminTarefa);
router.delete("/admin/tarefas/:id", autenticarToken, exigirAdmin, controllers.deleteAdminTarefa);

router.get("/dashboard/resumo", autenticarToken, controllers.getDashboard);

router.get("/areas", autenticarToken, controllers.getAreas);
router.get("/admin/usuarios", autenticarToken, exigirAdmin, controllers.getUsuarios);
router.post("/admin/usuarios", autenticarToken, exigirAdmin, controllers.postUsuario);
router.put("/admin/usuarios/:id", autenticarToken, exigirAdmin, controllers.putUsuario);
router.patch("/admin/usuarios/:id/status", autenticarToken, exigirAdmin, controllers.patchStatusUsuario);

module.exports = router;