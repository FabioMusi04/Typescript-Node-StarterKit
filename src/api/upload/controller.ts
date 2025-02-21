import { generateControllers } from "../../utils/lib/generator/index.ts";
import UploadedFiles from "./model.ts";

export default generateControllers(UploadedFiles, "uploadedFile");