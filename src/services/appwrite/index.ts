import { Account, Client, Storage } from "node-appwrite";
import Config from "../../config.ts";

const client: Client = new Client();

client
    .setEndpoint(Config.appwrite.endpoint)
    .setProject(Config.appwrite.projectId)
    .setKey(Config.appwrite.apiKey);


export const account = new Account(client);
export const storage = new Storage(client);

export const BucketProfilePicture = await storage.getBucket(Config.appwrite.bucketProfileId);
export const BucketUploads = await storage.getBucket(Config.appwrite.bucketUploadsId);

export default client;
