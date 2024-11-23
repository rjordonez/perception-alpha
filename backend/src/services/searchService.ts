// src/services/searchService.ts

import { pool } from '../utils/db';

/**
 * Searches for similar papers based on a given embedding vector.
 * @param userEmbedding - The user's embedding vector as a number array.
 * @returns A list of similar papers.
 */
export async function searchSimilarPapers(userEmbedding: number[]) {
  const client = await pool.connect();

  try {
    // Format the embedding to match the vector type requirements
    const formattedEmbedding = '[' + userEmbedding.join(',') + ']';

    const res = await client.query(
      `SELECT id, title, content
       FROM papers
       ORDER BY embedding <-> $1
       LIMIT 10;`,
      [formattedEmbedding]
    );

    return res.rows;
  } finally {
    client.release();
  }
}
