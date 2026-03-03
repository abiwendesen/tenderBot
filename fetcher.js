import fetch from "node-fetch";
import fs from 'fs';
import { db } from "./db.js";
export const fetcher = async(ctx) => {
    try{
       
       const response = await fetch('https://production.egp.gov.et/po-gw/cms-v2/api/sourcing/get-grouped-sourcing?type=all&skip=0&top=500&locale=en&orderBy%5B0%5D.field=invitationDate&orderBy%5B0%5D.direction=desc',{
        method: 'GET',

        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
        },
        
        timeout:1000
       });

       const data = await response.json();
      

      // const jsonData = JSON.stringify(data,null,2);

    //    fs.writeFile('data1.json',jsonData,'utf-8',(err)=>{
    //     if(err){
    //         console.log(er)
    //     }
    //     else
    //         console.log("data writen to file");
    //    });
    
          for( let item of data.items){
             for( let row of item.result){
            //  const [check] = await db.query("SELECT *FROM tender where tenderId =?",[row.id]);
            //  if(check.length >0 )continue;

             const [insert] = await db.query('INSERT INTO tender (tenderId, lotId, lotName, lotDescription, procurementReferenceNo, procuringEntity, lotRefNumber, submissionDeadline, procurementCategory) VALUES(?,?,?,?,?,?,?,?,?)',
                [row.id,
                row.lotId,
                row.lotName,
                row.lotDescription,
                row.procurementReferenceNo,
                row.procuringEntity,
                row.lotRefNumber,
                row.submissionDeadline,
                row.procurementCategory]

             );
             
          }
       }

       
       

    }catch(err){
        console.log(err)
        ctx.reply(err + "error")
    }
}