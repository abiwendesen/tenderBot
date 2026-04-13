import { client } from './db/vectorDb.js';
import { embed, BGE_DIMS } from './embeddings.js';

const COLLECTION_NAME = 'tenders';

export async function ensureCollection() {
  const { collections } = await client.getCollections();
  const exists = collections.some((c) => c.name === COLLECTION_NAME);

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: BGE_DIMS,
        distance: 'Cosine',
      },
    });
    console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
  }
}

/**
 * Index a tender in Qdrant for semantic search.
 * @param {Object} tender - Tender object from EGP API
 * @param {string} tender.id - Tender/lot ID (used as Qdrant point ID)
 * @param {string} tender.lotName - Lot name
 * @param {string} tender.lotDescription - Lot description
 * @param {string} tender.procurementReferenceNo
 * @param {string} tender.procuringEntity
 * @param {string} tender.submissionDeadline
 * @param {string} tender.procurementCategory
 */
export async function indexTender(tender) {
  const text = [tender.lotName, tender.lotDescription].filter(Boolean).join(' ').trim();
  if (!text) return;

  const vector = await embed(text);

  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id: tender.id,
        vector,
        payload: {
          lotId: tender.lotId,
          lotName: tender.lotName,
          lotDescription: tender.lotDescription,
          procurementReferenceNo: tender.procurementReferenceNo,
          procuringEntity: tender.procuringEntity,
          submissionDeadline: tender.submissionDeadline,
          procurementCategory: tender.procurementCategory,
          lotReferenceNo: tender.lotReferenceNo ?? tender.lotRefNumber,
        },
      },
    ],
  });
}

/**
 * Search tenders by semantic similarity.
 * @param {string} query - Search query
 * @param {number} limit - Max results (default 5)
 * @returns {Promise<Object[]>} Search results with payload and score
 */
export async function searchTenders(query, limit = 5) {
  const vector = await embed(query);

  const results = await client.search(COLLECTION_NAME, {
    vector,
    limit,
    with_payload: true,
  });

  return results;
}
