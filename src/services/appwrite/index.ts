import { Account, Client, Storage, Models } from "node-appwrite";
import { generalLogger } from "../logger/winston.ts";

import Config from "../../config.ts";

const client: Client = new Client();

let account: Account | null = null;
let storage: Storage | null = null;
let BucketProfilePicture: Models.Bucket | null = null;
let BucketUploads: Models.Bucket | null = null;

if (Config.appwrite.enabled) {
    client
        .setEndpoint(Config.appwrite.endpoint)
        .setProject(Config.appwrite.projectId)
        .setKey(Config.appwrite.apiKey);

    account = new Account(client);
    storage = new Storage(client);

    (async () => {
        BucketProfilePicture = await storage.getBucket(Config.appwrite.bucketProfileId);
        BucketUploads = await storage.getBucket(Config.appwrite.bucketUploadsId);
    })();
} else {
    generalLogger.info("Appwrite is not enabled.");
}

export { account, storage, BucketProfilePicture, BucketUploads };
export default client;
