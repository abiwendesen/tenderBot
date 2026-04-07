import { REDIS_FLUSH_MODES } from 'redis';
import {client} from './db/vectorDb.js'
import { embedd } from "./utill/embedder.js";



export async function insertTender(tender) {
    const text = [tender.lotName, tender.lotDescription].join(' ').trim();

    if(!text)return;

    const vector = await embedd(text);

    await client.upsert('test_collection',
        {
            wait:true,
            points:[
                {
                    id: tender.id,
                    vector,
                    payload:{
                        title: tender.lotName,
                        category: tender.procurementCategory,
                        entity: tender.procuringEntity,
                        deadline: tender.submissionDeadline,
                        procurementReferenceNo: tender.procurementReferenceNo
                    }
                }
            ]
        }
    );
    
}


export async  function searchTender(query){
    const vector = await embedd(query);
    const limit = 8

    const result = await client.search('test_collection',{
        vector,
        limit,
        with_payload:true

    });

    return result;
}