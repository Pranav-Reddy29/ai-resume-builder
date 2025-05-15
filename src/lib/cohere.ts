import { env } from '@/env';
import { CohereClientV2 } from 'cohere-ai';

// Initialize Cohere with the API key
const COHERE_API_KEY = env.COHERE_API_KEY;
if (!COHERE_API_KEY) {
  throw new Error("Missing COHERE_API_KEY in environment variables.");
}

// Create the Cohere client
const cohere = new CohereClientV2({
  token: COHERE_API_KEY,
});

export default cohere;
