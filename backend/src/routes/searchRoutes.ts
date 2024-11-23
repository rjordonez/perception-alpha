import { Router } from 'express';
import { search } from '../controllers/searchController';

const router = Router();

// Define the POST / route for the search functionality
router.post('/', search);

// Export the router instance as the default export
export default router;
