import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import {generate} from './utils';
import path from 'path';
import {getAllFiles} from './file';
import {uploadFile} from './aws'
import {createClient} from 'redis';

const publisher = createClient();
publisher.connect();
const subscriber = createClient();
subscriber.connect();

const app = express();
// app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", // if you're using Vite
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl
    console.log(repoUrl);
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`))
    const files = getAllFiles(path.join(__dirname, 'output/'+id));
    // console.log(files);

    // files.forEach(async file => {
    //     await uploadFile(file.slice(__dirname.length+1), file);
    // })
    for (const file of files) {
        await uploadFile(file.slice(__dirname.length + 1), file);
    }
    publisher.lPush("build-queue", id);
    publisher.hSet("status", id, "uploaded")
    res.json({message: 'success', id: id}) 

})

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.get("/message", async (req, res) => {
    console.log('hiting message')
    const id = req.query.id;
    const response = await subscriber.hGet("message", id as string);
    console.log(response)
    res.json({
        status: response
    })
})

app.listen(3000, () => {
    console.log('server running on port 3000')
})