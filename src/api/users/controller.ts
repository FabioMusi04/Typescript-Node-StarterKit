import { generateControllers } from "../../utils/lib/generator/index.ts";
import User from "./model.ts";

export default generateControllers(User, "user");