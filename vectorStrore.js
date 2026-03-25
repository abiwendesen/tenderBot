import {client} from './db/vectorDb'
import { BGE_DIMS,embedd } from "./utill/embedder";



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
                        
                    }
                }
            ]
        }
    )
    
}