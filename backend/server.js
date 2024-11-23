require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pdfParse = require('pdf-parse'); // To parse PDFs
const { createClient } = require('@supabase/supabase-js'); // Supabase client
const { parseStringPromise } = require('xml2js'); // To parse XML

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware setup
app.use(
  cors({
    origin: 'http://localhost:3000', // Adjust based on your frontend's origin
  })
);
app.use(express.json()); // To parse JSON bodies

/**
 * Utility Function to Split Text into Chunks
 * @param {string} text - The text to split.
 * @param {number} maxLength - Maximum length of each chunk.
 * @returns {Array<{ order: number, content: string }>} - An array of objects with order and content.
 */
const splitTextIntoChunks = (text, maxLength = 20000) => {
  const chunks = [];
  let start = 0;
  let order = 1;
  while (start < text.length) {
    let end = start + maxLength;
    // Ensure we don't split in the middle of a word
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }
    // Sanitize content by removing null characters
    const content = text.substring(start, end).replace(/\u0000/g, '');
    chunks.push({ order, content });
    start = end;
    order++;
  }
  return chunks;
};

/**
 * Function to fetch papers from arXiv based on a query.
 * @param {string} query - The search query.
 * @param {number} maxResults - Maximum number of results to fetch.
 * @returns {Array} - Array of paper objects.
 */
const fetchArxivPapers = async (query, maxResults = 5) => {
  const apiUrl = 'http://export.arxiv.org/api/query';
  try {
    const response = await axios.get(apiUrl, {
      params: {
        search_query: `all:${query}`,
        start: 0,
        max_results: maxResults,
      },
    });

    const data = response.data;
    const parsedData = await parseStringPromise(data);
    const entries = parsedData.feed.entry || [];

    // Ensure entries is always an array
    const papers = Array.isArray(entries) ? entries : [entries];

    return papers.map((entry) => ({
      title: entry.title[0].trim(),
      authors: Array.isArray(entry.author)
        ? entry.author.map((author) => author.name[0].trim())
        : [entry.author.name[0].trim()],
      link: entry.id[0].trim(),
      date: new Date(entry.published[0]).toISOString(),
      pdf_url: entry.id[0].replace('abs', 'pdf').trim(),
    }));
  } catch (error) {
    console.error(`Error fetching data from arXiv for query "${query}":`, error.message);
    throw new Error('Failed to fetch data from arXiv.');
  }
};

/**
 * Function to download and parse PDF content.
 * @param {string} pdfUrl - URL to the PDF.
 * @returns {string} - Extracted text content.
 */
const downloadAndParsePDF = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data, 'binary');
    const pdfText = await pdfParse(pdfBuffer);
    // Sanitize content by removing null characters
    const sanitizedText = pdfText.text.replace(/\u0000/g, '');
    return sanitizedText;
  } catch (error) {
    console.error(`Error downloading or parsing PDF from ${pdfUrl}:`, error.message);
    return '';
  }
};

/**
 * Function to upload results to Supabase in batches.
 * @param {Array} results - Array of paper objects to upload.
 * @param {number} batchSize - Number of records per batch.
 */
const uploadToSupabaseInBatches = async (results, batchSize = 500) => {
  try {
    console.log(`Uploading ${results.length} results to Supabase in batches of ${batchSize}...`);
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
      const { data, error } = await supabase.from('papers').insert(batch);
      if (error) {
        console.error(`Error uploading batch starting at index ${i}:`, error.details || error.message);
        throw new Error('Failed to upload a batch of results to Supabase.');
      }
      console.log(`Successfully uploaded batch ${Math.floor(i / batchSize) + 1}:`, data);
    }
    console.log('All batches uploaded successfully.');
  } catch (error) {
    console.error('Supabase upload error:', error.message);
    throw error;
  }
};

/**
 * Route to handle search requests.
 * Expects a JSON body with a "query" field.
 */
app.post('/api/search', async (req, res) => {
  const { query } = req.body;

  // Validate the query parameter
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  console.log(`Received search query: "${query}"`);

  try {
    // **First GPT Call**
    const firstGPTMessages = [
      {
        role: 'system',
        content: 'You write a better prompt that is towards research, keep it broad.',
      },
      { role: 'user', content: query },
    ];

    const firstGPTResponse = await callOpenAI(firstGPTMessages, 150, 0.7);

    // **Second GPT Call**
    const secondGPTPrompt = `Aggregate the following data and provide a list of potential topics, even if they relate only slightly. You can go straight into it starting with 1. but only go to 3:\n\n"${firstGPTResponse}"`;

    const secondGPTMessages = [
      { role: 'system', content: 'You are a data aggregator and topic extractor.' },
      { role: 'user', content: secondGPTPrompt },
    ];

    const secondGPTResponse = await callOpenAI(secondGPTMessages, 200, 0.7);

    // Parse the topics from GPT response
    const topics = secondGPTResponse
      .split('\n') // Split by newline
      .map((topic) => topic.trim()) // Trim whitespace
      .filter((topic) => topic && !topic.startsWith('-')); // Filter out empty lines and sub-topics

    console.log('Generated topics:', topics);

    // Initialize an array to hold all paper results
    const results = [];

    // Iterate over each topic to fetch and process papers
    for (const topic of topics) {
      // Remove numbering like "1. Trends in Engineering Education"
      const cleanedTopic = topic.replace(/^\d+\.\s*/, '').trim();

      console.log(`Fetching papers for topic: ${cleanedTopic}`);
      const papers = await fetchArxivPapers(cleanedTopic);

      for (const paper of papers) {
        console.log(`Parsing PDF for paper: ${paper.title}`);
        const content = await downloadAndParsePDF(paper.pdf_url);

        if (!content) {
          console.warn(`No content extracted for paper: ${paper.title}`);
          continue; // Skip papers with no content
        }

        // Split the content into chunks if necessary
        const contentChunks = splitTextIntoChunks(content, 20000);

        // Insert each chunk into the results with its order
        contentChunks.forEach((chunk) => {
          results.push({
            title: paper.title,
            authors: paper.authors, // Keep as an array for `jsonb`
            link: paper.link,
            date: paper.date, // Ensure this is in ISO string format
            pdf_url: paper.pdf_url,
            content: chunk.content,
            chunk_order: [chunk.order.toString()], // Convert numeric order to `text[]`
          });
        });
      }
    }

    // Upload all results to Supabase in batches
    await uploadToSupabaseInBatches(results, 500); // Adjust batch size as needed

    // Send a success response back to the client
    res.json({ message: 'Results successfully uploaded to Supabase', results: results.length });
  } catch (error) {
    console.error('Error processing search request:', error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

/**
 * Function to make a call to OpenAI's ChatGPT.
 * @param {Array} messages - Array of message objects for the conversation.
 * @param {number} maxTokens - Maximum number of tokens for the response.
 * @param {number} temperature - Sampling temperature.
 * @returns {string} - The generated response from ChatGPT.
 */
const callOpenAI = async (messages, maxTokens = 150, temperature = 0.7) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is not configured.');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: maxTokens,
        temperature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(
      'Error fetching data from OpenAI:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Failed to fetch data from OpenAI.');
  }
};

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
