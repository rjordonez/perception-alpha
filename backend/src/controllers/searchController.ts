// src/controllers/searchController.ts

import { Request, Response, NextFunction } from 'express';
import { generateSingleUserEmbedding } from '../services/embeddingService';
import { searchSimilarPapers } from '../models/paperModel';

/**
 * Handles search requests by generating embeddings and retrieving similar papers.
 */
export const search = async (req: Request, res: Response, next: NextFunction) => {
  const { query, limit } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query parameter is required.' });
    return;
  }

  try {
    // Generate embedding for the user query
    const userEmbedding = await generateSingleUserEmbedding(query);

    // Perform the similarity search
    const results = await searchSimilarPapers(userEmbedding, limit || 10);

    // Prepare the response with similarity scores
    const response = results.map((paper: any) => ({
      id: paper.id,
      title: paper.title,
      content: paper.content,
      similarity: paper.distance, // or adjust based on your metric
    }));

    res.json(response); // Removed 'return'
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'Internal server error.' }); // Removed 'return'
  }
};
