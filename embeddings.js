import { pipeline } from '@xenova/transformers';

const BGE_DIMS = 1024;
let extractor = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/bge-m3',
      { quantized: true }
    );
  }
  return extractor;
}

/**
 * Embed a single text. Returns a 1024-dim vector (normalized for cosine similarity).
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
export async function embed(text) {
  const model = await getExtractor();
  const output = await model(text, {
    pooling: 'cls',
    normalize: true,
  });
  return Array.from(output.data);
}

/**
 * Embed multiple texts in batch (faster than one-by-one).
 * @param {string[]} texts - Texts to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export async function embedBatch(texts) {
  const arr = Array.isArray(texts) ? texts : [texts];
  if (arr.length === 0) return [];
  const model = await getExtractor();
  const output = await model(arr, {
    pooling: 'cls',
    normalize: true,
  });
  // Output shape: [num_texts, dims] - split into array of vectors
  const dims = output.dims?.[output.dims.length - 1] ?? BGE_DIMS;
  const data = Array.from(output.data);
  const vectors = [];
  for (let i = 0; i < arr.length; i++) {
    vectors.push(data.slice(i * dims, (i + 1) * dims));
  }
  return vectors;
}

export { BGE_DIMS };
