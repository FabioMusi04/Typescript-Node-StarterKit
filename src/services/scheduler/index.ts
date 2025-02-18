import agenda from "../agenda/index.ts"
import { generalLogger } from "../logger/winston.ts";

export const start = async (): Promise<void> => {
  generalLogger.info("Starting scheduler service...");
  agenda.start();
};