import { generateControllers } from "../../utils/lib/generator/index.ts";
/* import { Request, Response } from "express"; */
import UploadedFiles from "./model.ts";

const actions = generateControllers(UploadedFiles, "uploadedFile");

export { actions };