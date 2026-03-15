const express = require('express');
const publicController = require('../controllers/public.controller');

const router = express.Router();

router.get('/recipes', publicController.getRecipes);
router.get('/content', publicController.getPublicContent);
router.post('/suggestions', publicController.createSuggestion);
router.post('/contacts', publicController.createContact);

module.exports = router;
