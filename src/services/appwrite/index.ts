import { Account, Client, Storage } from "node-appwrite";
import Config from "../../config.ts";

const client: Client = new Client();

client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(Config.appwrite.projectId)
    .setKey(Config.appwrite.apiKey);


export const account = new Account(client);
export const storage = new Storage(client);

export const BucketProfilePicture = await storage.getBucket(Config.appwrite.bucketProfileId);
export const BucketUploads = await storage.getBucket(Config.appwrite.bucketUploadsId);

export default client;
