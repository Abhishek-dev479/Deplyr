import { createClient } from "redis";
import {copyFinalDist, downloadS3Folder} from './aws'
import { buildProject } from "./utils";
const subscriber = createClient();
subscriber.connect();
const publisher = createClient();
publisher.connect();


async function main(){
    console.log('deployment running,...')
    while(1){
        const response = await subscriber.brPop(
            'build-queue',
            0
        );
        const id = response?.element
        if (!id) {
            console.error("Invalid ID received from queue.");
            continue;
        }
        console.log(response);
        try{
            await downloadS3Folder('output/'+id);
            console.log('downloaded')
            await buildProject(id);
            await copyFinalDist(id);
            publisher.hSet("status", id, "deployed")
        }
        catch(e){
            console.error('erororor: ;; '+e);
            publisher.hSet('status', id, 'error');

            let errorMsg: string;
            if (e instanceof Error) {
                errorMsg = e.message;
            } else {
                errorMsg = String(e);
            }
            console.log('setting error in queue...');
            await publisher.hSet('message', id, errorMsg);
            const storedMsg = await publisher.hGet('message', id);
            console.log('Stored error message:', storedMsg);
        }

    }
}

main()
