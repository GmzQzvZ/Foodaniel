const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/bootstrap', authenticateToken, adminController.getBootstrapData);

router.post('/books', authenticateToken, adminController.createBook);
router.put('/books/:id', authenticateToken, adminController.updateBook);
router.delete('/books/:id', authenticateToken, adminController.deleteBook);

router.post('/recipes', authenticateToken, adminController.createRecipe);
router.put('/recipes/:id', authenticateToken, adminController.updateRecipe);
router.delete('/recipes/:id', authenticateToken, adminController.deleteRecipe);

router.post('/videos', authenticateToken, adminController.createVideo);
router.put('/videos/:id', authenticateToken, adminController.updateVideo);
router.delete('/videos/:id', authenticateToken, adminController.deleteVideo);

router.post('/users', authenticateToken, adminController.createUser);
router.put('/users/:id', authenticateToken, adminController.updateUser);
router.delete('/users/:id', authenticateToken, adminController.deleteUser);

router.post('/tasks', authenticateToken, adminController.createTask);
router.put('/tasks/:id', authenticateToken, adminController.updateTask);
router.delete('/tasks/:id', authenticateToken, adminController.deleteTask);
router.post('/emails/notify', authenticateToken, adminController.sendNotificationEmails);

module.exports = router;
