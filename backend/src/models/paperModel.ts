// src/models/paperModel.ts

import { pool } from '../utils/db';

/**
 * Fetch papers that do not have embeddings.
 */
export async function getPapersWithoutEmbeddings() {
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT id, content FROM papers WHERE embedding IS NULL');
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * Update a paper's embedding in the database.
 * @param paperId - The ID of the paper.
 * @param embedding - The embedding vector as a number array.
 */
export async function updatePaperEmbedding(paperId: number, embedding: number[]) {
  const client = await pool.connect();

  try {
    // Format the embedding to match the vector type requirements
    const formattedEmbedding = '[' + embedding.join(',') + ']';

    await client.query(
      `UPDATE papers
       SET embedding = $1,
           search_vector = to_tsvector(content)
       WHERE id = $2;`,
      [formattedEmbedding, paperId]
    );
  } finally {
    client.release();
  }
}

/**
 * Searches for similar papers based on a given embedding vector.
 * @param userEmbedding - The user's embedding vector as a number array.
 * @param limit - Number of results to return (default: 10).
 * @returns A list of similar papers with similarity scores.
 */
export async function searchSimilarPapers(userEmbedding: number[], limit: number = 10) {
  const client = await pool.connect();

  try {
    // Format the embedding to match the vector type requirements
    const formattedEmbedding = '[' + userEmbedding.join(',') + ']';

    const res = await client.query(
      `
      SELECT id, title, content, embedding <-> $1 AS distance
      FROM papers
      ORDER BY embedding <-> $1
      LIMIT $2;
      `,
      [formattedEmbedding, limit]
    );

    return res.rows;
  } catch (error) {
    console.error('Error in searchSimilarPapers:', error);
    throw error;
  } finally {
    client.release();
  }
}
