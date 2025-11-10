const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  loginPage,
  login,
  logout,
  getProjects,
  createProjectPage,
  createProject,
  editProjectPage,
  updateProject,
  deleteProject,
  getStages,
  createStagePage,
  createStage,
  editStagePage,
  updateStage,
  deleteStage,
  getActivities,
  createActivityPage,
  createActivity,
  editActivityPage,
  updateActivity,
  deleteActivity,
  toggleActivity,
  getClients,
  createClientPage,
  createClient,
  editClientPage,
  updateClient,
  deleteClient,
  getAdmins,
  createAdminPage,
  createAdmin,
  editAdminPage,
  updateAdmin,
  deleteAdmin
} = require('../controllers/adminController');

// Auth routes (must be before authMiddleware)
router.get('/login', loginPage);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.use(authMiddleware);

// Redirect /admin to /admin/projects (after authentication check)
router.get('/', (req, res) => {
  res.redirect('/admin/projects');
});

router.get('/projects', getProjects);
router.get('/projects/new', createProjectPage);
router.post('/projects', createProject);
router.get('/projects/:id/edit', editProjectPage);
router.post('/projects/:id', updateProject);
router.post('/projects/:id/delete', deleteProject);

router.get('/projects/:projectId/stages', getStages);
router.get('/projects/:projectId/stages/new', createStagePage);
router.post('/projects/:projectId/stages', createStage);
router.get('/projects/:projectId/stages/:id/edit', editStagePage);
router.post('/projects/:projectId/stages/:id', updateStage);
router.post('/projects/:projectId/stages/:id/delete', deleteStage);

router.get('/projects/:projectId/stages/:stageId/activities', getActivities);
router.get('/projects/:projectId/stages/:stageId/activities/new', createActivityPage);
router.post('/projects/:projectId/stages/:stageId/activities', createActivity);
router.get('/projects/:projectId/stages/:stageId/activities/:id/edit', editActivityPage);
router.post('/projects/:projectId/stages/:stageId/activities/:id', updateActivity);
router.post('/projects/:projectId/stages/:stageId/activities/:id/delete', deleteActivity);
router.post('/activities/:id/toggle', toggleActivity);

// Clients Management
router.get('/clients', getClients);
router.get('/clients/new', createClientPage);
router.post('/clients', createClient);
router.get('/clients/:id/edit', editClientPage);
router.post('/clients/:id', updateClient);
router.post('/clients/:id/delete', deleteClient);

// Admins Management
router.get('/admins', getAdmins);
router.get('/admins/new', createAdminPage);
router.post('/admins', createAdmin);
router.get('/admins/:id/edit', editAdminPage);
router.post('/admins/:id', updateAdmin);
router.post('/admins/:id/delete', deleteAdmin);

module.exports = router;

