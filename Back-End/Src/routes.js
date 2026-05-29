const express = require("express");
const controllers = require("./controllers");

const {
  autenticar,
  exigirAdmin
} = require("./middlewares/auth.middleware");

const router = express.Router();

// =========================
// ROTAS PÚBLICAS
// =========================

router.get("/", controllers.healthCheck);
router.post("/login", controllers.login);

// =========================
// ROTAS AUTENTICADAS
// =========================

router.get("/estados", autenticar, controllers.getEstados);
router.get("/filiais", autenticar, controllers.getFiliais);

router.get("/tarefas", autenticar, controllers.getTarefas);

router.get("/historico", autenticar, controllers.getHistorico);
router.post("/historico", autenticar, controllers.postHistorico);
router.delete("/historico/:id", autenticar, controllers.deleteHistoricoPorId);
router.delete("/historico", autenticar, exigirAdmin, controllers.deleteHistorico);

router.get("/solicitacoes", autenticar, controllers.getSolicitacoes);
router.post("/solicitacoes", autenticar, controllers.postSolicitacao);
router.patch("/solicitacoes/:id/status", autenticar, controllers.patchSolicitacaoStatus);

router.get("/dashboard/resumo", autenticar, controllers.getDashboard);

// =========================
// ROTAS ADMIN
// =========================

router.get("/areas", autenticar, exigirAdmin, controllers.getAreas);

router.get("/admin/usuarios", autenticar, exigirAdmin, controllers.getUsuarios);
router.post("/admin/usuarios", autenticar, exigirAdmin, controllers.postUsuario);
router.put("/admin/usuarios/:id", autenticar, exigirAdmin, controllers.putUsuario);
router.patch("/admin/usuarios/:id/status", autenticar, exigirAdmin, controllers.patchStatusUsuario);

router.get("/admin/auditoria", autenticar, exigirAdmin, controllers.getAuditoria);
router.get("/admin/tarefas", autenticar, exigirAdmin, controllers.getAdminTarefas);
router.post("/admin/tarefas", autenticar, exigirAdmin, controllers.postAdminTarefa);
router.put("/admin/tarefas/:id", autenticar, exigirAdmin, controllers.putAdminTarefa);
router.delete("/admin/tarefas/:id", autenticar, exigirAdmin, controllers.deleteAdminTarefa);

module.exports = router;