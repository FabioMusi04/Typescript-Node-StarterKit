import { Account, Client } from "node-appwrite";
import Config from "../../config.ts";

const client: Client = new Client();

client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(Config.appwrite.projectId)
    .setKey(Config.appwrite.apiKey);


export const account = new Account(client);


export default client;
