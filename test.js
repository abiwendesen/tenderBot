import { client } from "./db/vectorDb.js";
import dotenv from 'dotenv'
dotenv.config()

import OpenAI from "openai";
const openai = new OpenAI({apiKey: process.env.openAI_API_KEY});

const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "africa union has large building",
    encoding_format: 'float'
})


console.log(embedding);

await client.createCollection('test_collection',{
    vectors:{size: 4, distance: "Dot"}
})


const operation = await client.upsert("test_collection",{
    wait: true,
    points:[
        {id: 1 , vector:[0.05, 0.61, 0.76, 0.74], payload : {city: "Addis Ababa is the heart of africa " }},
        {id: 2 , vector:[0.19, 0.81, 0.75, 0.11],payload : {city: "Melbourne just a city in Australia aussies love it but not that much of city "}},
        { id: 3, vector: [0.36, 0.55, 0.47, 0.94], payload: { city: "Moscow the land of lenin and stali, you could say the birth place of socializm" } }
    ]
})

// let searchResult = await client.query('test_collection',
//     {qu}
// )
//console.log(operation)