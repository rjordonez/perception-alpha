import app from './app';
import { Request, Response } from 'express';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});
