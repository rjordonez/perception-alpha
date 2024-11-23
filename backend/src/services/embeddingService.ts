// src/services/embeddingService.ts

import openai from '../utils/openaiClient';

/**
 * Generates embeddings for multiple inputs.
 * @param inputs - An array of strings.
 * @returns A 2D array of embeddings.
 */
export async function generateUserEmbeddings(inputs: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: inputs,
    });

    // Extract embeddings from the response
    const embeddings = response.data.map((item: any) => item.embedding);
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Generates an embedding for a single input.
 * @param input - A single string.
 * @returns A 1D array representing the embedding.
 */
export async function generateSingleUserEmbedding(input: string): Promise<number[]> {
  const embeddings = await generateUserEmbeddings([input]);
  return embeddings[0];
}
