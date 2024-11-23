import express from 'express';
import searchRoutes from './routes/searchRoutes';

const app = express();

app.use(express.json());

// Use the search routes
app.use('/api/search', searchRoutes);

export default app;
