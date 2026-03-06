import { client } from "./db/vectorDb.js";


await client.createCollection('test_collection',{
    vectors:{size: 4, distance: "Dot"}
})


const operation = await client.upsert("test_collection",{
    wait: true,
    points:[
        {id: 1 , vector:[0.05, 0.61, 0.76, 0.74], payload : {city: "Addis Ababa"}},
        {id: 2 , vector:[0.19, 0.81, 0.75, 0.11],payload : {city: "Melbourne"}},
        { id: 3, vector: [0.36, 0.55, 0.47, 0.94], payload: { city: "Moscow" } }
    ]
})


console.log(operation)