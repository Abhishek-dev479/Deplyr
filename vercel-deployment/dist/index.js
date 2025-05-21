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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const aws_1 = require("./aws");
const utils_1 = require("./utils");
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
const publisher = (0, redis_1.createClient)();
publisher.connect();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('deployment running,...');
        while (1) {
            const response = yield subscriber.brPop('build-queue', 0);
            const id = response === null || response === void 0 ? void 0 : response.element;
            if (!id) {
                console.error("Invalid ID received from queue.");
                continue;
            }
            console.log(response);
            try {
                yield (0, aws_1.downloadS3Folder)('output/' + id);
                console.log('downloaded');
                yield (0, utils_1.buildProject)(id);
                yield (0, aws_1.copyFinalDist)(id);
                publisher.hSet("status", id, "deployed");
            }
            catch (e) {
                console.error('erororor: ;; ' + e);
                publisher.hSet('status', id, 'error');
                let errorMsg;
                if (e instanceof Error) {
                    errorMsg = e.message;
                }
                else {
                    errorMsg = String(e);
                }
                console.log('setting error in queue...');
                yield publisher.hSet('message', id, errorMsg);
                const storedMsg = yield publisher.hGet('message', id);
                console.log('Stored error message:', storedMsg);
            }
        }
    });
}
main();
