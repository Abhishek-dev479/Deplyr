"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});
const app = (0, express_1.default)();
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
app.all("/{*any}", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const contents = yield s3.getObject({
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
    }
    catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(404).send("File not found");
            return;
        }
        // If headers were already sent, do nothing
    }
}));
app.listen(3001, () => {
    console.log('server running on port 3001');
});
