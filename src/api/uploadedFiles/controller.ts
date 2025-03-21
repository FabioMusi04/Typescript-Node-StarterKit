import { generateControllers } from "../../utils/lib/generator/index.ts";
import UploadedFiles from "./model.ts";

const actions = generateControllers(UploadedFiles, "uploadedFile");

export { actions };