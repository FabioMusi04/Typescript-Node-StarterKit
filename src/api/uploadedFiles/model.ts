import { ConfigurableSchema } from "../../utils/lib/mongoose/index.ts";
import { Model, Schema } from "mongoose";
import mongoose, { Document, Types } from "mongoose";
import mongooseToSwagger from 'mongoose-to-swagger';

const LinkedEntitySchema = new Schema(
	{
		linkedEntityType: String,
		linkedEntityId: Types.ObjectId,
	},
	{
		_id: false,
		id: false
	}
);

export interface IUploadedFile extends Document {
  uploaderId: Schema.Types.ObjectId;
  documentType: string;
  originalName: string;
  full: string;
  additionalInfo: object;
  linkedEntity: typeof LinkedEntitySchema;
  metadata: object;
  thumbnail: object;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type UploadedFileModel = Model<IUploadedFile, {}>;

const uploadedFileSchema = new ConfigurableSchema<IUploadedFile>({
  uploaderId: {
    type: Types.ObjectId,
  },
  documentType: {
    type: String,
  },
  originalName: {
    type: String,
  },
  full: {
    type: String,
  },
  additionalInfo: {
    type: Object
  },
  linkedEntity: {
    type: LinkedEntitySchema
  },
  metadata: {
    type: Object
  },
  thumbnail: {
    type: Object
  }
}, {
  timestamps: true,
});

const UploadedFile = mongoose.model<IUploadedFile, UploadedFileModel>('UploadedFile', uploadedFileSchema);
export const swaggerSchema = mongooseToSwagger(UploadedFile);

export default UploadedFile;