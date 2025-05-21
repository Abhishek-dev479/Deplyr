import express from "express";
import { S3 } from "aws-sdk";
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

const app = express();

// app.all("/{*any}", async (req, res) => {
//     const host = req.hostname;

//     const id = host.split(".")[0];
//     const filePath = req.path;
    
//     console.log(id+'======'+filePath);
//     console.log('s3 key: '+`dist/${id}${filePath}`)
//     if (filePath === '/favicon.ico') {
//         res.status(204).end(); // No Content
//         return;
//     }

//     const contents = await s3.getObject({
//         Bucket: "my-vercel-upload",
//         Key: `dist/${id}${filePath}`
//     }).promise();
    
//     const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
//     res.set("Content-Type", type);

//     res.send(contents.Body);
// })

app.all("/{*any}", async (req, res) => {
    try {
        const host = req.hostname;
        const id = host.split(".")[0];
        const filePath = req.path;

        console.log(id + ' ====== ' + filePath);
        console.log('s3 key: ' + `dist/${id}${filePath}`);

        if (filePath === '/favicon.ico') {
            res.status(204).end(); // No Content
            return;
        }

        const contents = await s3.getObject({
            Bucket: "my-vercel-upload",
            Key: `dist/${id}${filePath}`
        }).promise();

        const type = filePath.endsWith(".html") ? "text/html" :
                     filePath.endsWith(".css") ? "text/css" :
                     filePath.endsWith(".js") ? "application/javascript" :
                     "application/octet-stream";

        res.set("Content-Type", type);
         res.send(contents.Body);
         return;

    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
             res.status(404).send("File not found");
             return;
        }
        // If headers were already sent, do nothing
    }
});


app.listen(3001, () => {
    console.log('server running on port 3001')
});