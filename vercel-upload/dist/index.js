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
const cors_1 = __importDefault(require("cors"));
const simple_git_1 = __importDefault(require("simple-git"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const file_1 = require("./file");
const aws_1 = require("./aws");
const redis_1 = require("redis");
const publisher = (0, redis_1.createClient)();
publisher.connect();
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
const app = (0, express_1.default)();
// app.use(cors());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // if you're using Vite
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express_1.default.json());
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    const id = (0, utils_1.generate)();
    yield (0, simple_git_1.default)().clone(repoUrl, path_1.default.join(__dirname, `output/${id}`));
    const files = (0, file_1.getAllFiles)(path_1.default.join(__dirname, 'output/' + id));
    // console.log(files);
    // files.forEach(async file => {
    //     await uploadFile(file.slice(__dirname.length+1), file);
    // })
    for (const file of files) {
        yield (0, aws_1.uploadFile)(file.slice(__dirname.length + 1), file);
    }
    publisher.lPush("build-queue", id);
    publisher.hSet("status", id, "uploaded");
    res.json({ message: 'success', id: id });
}));
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield subscriber.hGet("status", id);
    res.json({
        status: response
    });
}));
app.get("/message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hiting message');
    const id = req.query.id;
    const response = yield subscriber.hGet("message", id);
    console.log(response);
    res.json({
        status: response
    });
}));
app.listen(3000, () => {
    console.log('server running on port 3000');
});
