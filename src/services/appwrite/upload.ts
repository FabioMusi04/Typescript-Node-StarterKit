import { ID } from "node-appwrite";
import { storage } from "./index.ts";
import { InputFile } from "node-appwrite/file";
import { generalLogger } from "../logger/winston.ts";
import { LinkedEntityTypeEnum } from "../../utils/enum.ts";
import { Schema } from "mongoose";

import UploadedFile, { IUploadedFile } from "../../api/uploadedFiles/model.ts";
import Config from "../../config.ts";

export async function uploadImage(fileBuffer: Buffer, fileName: string, item: { userId: Schema.Types.ObjectId, _id: Schema.Types.ObjectId }, linkedEntityType: LinkedEntityTypeEnum = LinkedEntityTypeEnum.IMAGE): Promise<IUploadedFile> {
    if (storage === null) {
        throw new Error('Appwrite is not enabled.');
    }

    try {
        const response = await storage.createFile(
            Config.appwrite.bucketUploadsId,
            ID.unique(),
            InputFile.fromBuffer(
                fileBuffer as Buffer,
                fileName,
            ));

        const uploadedFile = await UploadedFile.create({
            uploaderId: item.userId,
            documentType: 'image',
            originalName: fileName,
            full: response.$id,
            linkedEntity: {
                linkedEntityType: linkedEntityType,
                linkedEntityId: item._id,
            },
            metadata: {},
            thumbnail: {},
        });

        return uploadedFile;
    } catch (error) {
        generalLogger.error('Upload failed:', error);
        throw error;
    }
}
