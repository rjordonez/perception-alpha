// src/routes/index.ts

import express from 'express';
import { search } from '../controllers/searchController';

const router = express.Router();

// Define the search route
router.post('/search', search);

export default router;
