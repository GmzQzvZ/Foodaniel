const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/bootstrap', adminController.getBootstrapData);

router.post('/books', adminController.createBook);
router.put('/books/:id', adminController.updateBook);
router.delete('/books/:id', adminController.deleteBook);

router.post('/recipes', adminController.createRecipe);
router.put('/recipes/:id', adminController.updateRecipe);
router.delete('/recipes/:id', adminController.deleteRecipe);
router.get('/recipes/:id', adminController.getRecipeById);

router.post('/videos', adminController.createVideo);
router.put('/videos/:id', adminController.updateVideo);
router.delete('/videos/:id', adminController.deleteVideo);

router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.post('/tasks', adminController.createTask);
router.put('/tasks/:id', adminController.updateTask);
router.delete('/tasks/:id', adminController.deleteTask);
router.post('/emails/notify', adminController.sendNotificationEmails);

module.exports = router;
