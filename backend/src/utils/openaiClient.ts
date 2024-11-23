import OpenAI from 'openai'; // Default export
import { config } from 'dotenv';

config(); // Load environment variables from .env

// Create an instance of the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your .env file
});

export default openai; // Export the OpenAI client for reuse
