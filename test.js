import { client } from "./db/vectorDb.js";
import dotenv from 'dotenv';
import { embedd } from "./utill/embedder.js";
dotenv.config()

  
 try{

const check =  await embedd('africa union has large building in addis ababa')
 console.log('here')
 console.log("first 5 values:", check?.slice(0, 4));

 const operation = await client.upsert("test_collection",{
    wait: true,
    points:[
        {id: 1 , vector:[0.71, 0.33, 0.64, 0.12], payload : {city: "Addis Ababa is the heart of africa" }},
        {id: 2 , vector:[0.41, 0.22, 0.35, 0.19],payload : {city: "Melbourne is just a city in Australia, aussies love it, but not that much of city "}},
        { id: 3, vector: [0.63, 0.48, 0.72, -0.15], payload: { city: "Moscow the land of lenin and stali, you could say the birth place of socializm" } }
    ]
})

let searchResult = await client.query('test_collection',
    {
        query:check.slice(0,4),
        with_payload: false,
        limit: 2
    }
)
console.log(searchResult)

 }catch(err){
    console.error("emdedding failed", err)
 }




