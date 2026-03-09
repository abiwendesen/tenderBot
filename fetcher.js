import fetch from "node-fetch";
import { db } from "./db/db.js";
import { indexTender } from "./vectorStore.js";
const EGP_BASE = 'https://production.egp.gov.et/po-gw/cms-v2/api/sourcing/get-grouped-sourcing';
const PAGE_SIZE = 50;
const FETCH_TIMEOUT = 15000;

export function getKeywords() {
  const raw = process.env.KEYWORDS?.trim();
  if (!raw) return [];
  return raw.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
}

function matchesKeywords(row, keywords) {
  if (!keywords.length) return true;
  const text = [
    row.lotName,
    row.lotDescription,
    row.procurementCategory,
    row.procuringEntity,
    row.procurementReferenceNo,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

export const fetcher = async (ctx) => {
  let skip = 0;
  let hasMore = true;
  let totalFetched = 0;
  const keywords = getKeywords();

  while (hasMore) {
    try {
      const params = new URLSearchParams({
        type: 'all',
        skip: String(skip),
        top: String(PAGE_SIZE),
        locale: 'en',
        'orderBy[0].field': 'invitationDate',
        'orderBy[0].direction': 'desc',
      });
      const dateFrom = process.env.EGP_DATE_FROM?.trim();
      if (dateFrom !== '' && dateFrom !== 'false') {
        params.set('invitationDateFrom', dateFrom || '2015-01-01');
      }
      const url = `${EGP_BASE}?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
        },
        timeout: FETCH_TIMEOUT,
      });

       const data = await response.json();
      
    if(data && data.items.length >0){
      for (let item of data.items) {
        for (let row of item.result) {
          if (!matchesKeywords(row, keywords)) continue;

          const check = await db.query('SELECT * FROM tender WHERE "tenderId" = $1', [row.id]);
          if (check.rows.length > 0) continue;

              await db.query(
                `INSERT INTO tender ("tenderId", "lotId", "lotName", "lotDescription", "procurementReferenceNo", "procuringEntity", "lotRefNumber", "submissionDeadline", "procurementCategory")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT ("tenderId") DO NOTHING`,
                [
                  row.id,
                  row.lotId,
                  row.lotName,
                  row.lotDescription,
                  row.procurementReferenceNo,
                  row.procuringEntity,
                  row.lotReferenceNo ?? row.lotRefNumber,
                  row.submissionDeadline,
                  row.procurementCategory,
                ]
              );

          try {
            await indexTender(row);
          } catch (err) {
            console.error('Qdrant index error:', err?.message ?? err);
          }
          totalFetched++;
        }
      }

      if (ctx?.reply && totalFetched % 100 === 0 && totalFetched > 0) {
        ctx.reply(`Fetching... ${totalFetched} tenders processed`).catch(() => {});
      }
      skip += PAGE_SIZE;

      if (!data.items?.length || data.items.length < PAGE_SIZE) {
        hasMore = false;
      }

    }

 
    else{
      hasMore = false
    }
      // const jsonData = JSON.stringify(data,null,2);

    //    fs.writeFile('data1.json',jsonData,'utf-8',(err)=>{
    //     if(err){
    //         console.log(er)
    //     }
    //     else
    //         console.log("data writen to file");
    //    });
      
       

    } catch (err) {
      console.error('Fetch error:', err);
      ctx?.reply?.(`Error: ${err.message}`).catch(() => {});
      hasMore = false;
    }
  }
  if (ctx?.reply && totalFetched > 0) {
    ctx.reply(`Done. Fetched and indexed ${totalFetched} tenders.`).catch(() => {});
  }
}


export const interval = async (ctx) => {
  try {
    await fetcher(ctx);
  } catch (err) {
    console.error('Fetcher error:', err);
    ctx?.reply?.(`Error: ${err.message}`).catch(() => {});
  }
};