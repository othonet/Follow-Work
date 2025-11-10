const express = require('express');
const router = express.Router();
const clientAuthMiddleware = require('../middleware/clientAuth');
const { getProjects, getProjectDetails } = require('../controllers/publicController');
const { loginPage, login, logout } = require('../controllers/clientAuthController');

// Auth routes (public)
router.get('/login', loginPage);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes (require client authentication)
router.use(clientAuthMiddleware);
router.get('/', getProjects);
router.get('/projects/:id', getProjectDetails);

module.exports = router;

