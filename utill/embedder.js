import { pipeline } from "@xenova/transformers";

export const BGE_DIMS = 1024;
export const embedd = async(string)=>{
    const extaractor = await pipeline('feature-extraction',
         "Xenova/bge-m3",{quantized: true});

    const embedding = await extaractor(string,
        {pooling:'cls', normalize:true}
    )
    console.log("embedded")

    return  Array.from(embedding.data);
}



