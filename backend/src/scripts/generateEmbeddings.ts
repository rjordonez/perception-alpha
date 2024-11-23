// src/scripts/generateEmbeddings.ts

import { config } from 'dotenv';
import { generateSingleUserEmbedding } from '../services/embeddingService';
import { getPapersWithoutEmbeddings, updatePaperEmbedding } from '../models/paperModel';

config();

/**
 * Generates and updates embeddings for all papers without embeddings.
 */
async function generateEmbeddings() {
  try {
    const papers = await getPapersWithoutEmbeddings();

    if (papers.length === 0) {
      console.log('No papers found without embeddings.');
      process.exit(0);
    }

    console.log(`Found ${papers.length} papers without embeddings.`);

    for (const paper of papers) {
      try {
        console.log(`Processing paper ID ${paper.id}`);

        // Generate a single embedding for the paper's content
        const embedding = await generateSingleUserEmbedding(paper.content); // Returns number[]

        console.log(`Generated embedding for paper ID ${paper.id}`);

        // Update the paper with the generated embedding
        await updatePaperEmbedding(paper.id, embedding);
        console.log(`Updated paper ID ${paper.id} with embedding.`);
      } catch (error) {
        console.error(`Error updating embedding for paper ID ${paper.id}:`, error);
      }
    }

    console.log('All embeddings generated and stored successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error in generateEmbeddings:', error);
    process.exit(1);
  }
}

generateEmbeddings().catch((error) => {
  console.error('Error in generateEmbeddings:', error);
  process.exit(1);
});
