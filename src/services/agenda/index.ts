import { Job, JobAttributesData, Agenda } from "agenda";
import Config from "../../config.ts";
import { generalLogger } from "../logger/winston.ts";

export interface AgendaService {
  start(): Promise<void>;
  stop(): Promise<void>;
  // eslint-disable-next-line no-unused-vars
  scheduleJob(job: JobAttributesData): Promise<Job>;
  // eslint-disable-next-line no-unused-vars
  cancelJob(jobId: string): Promise<void>;
}

class AgendaServiceImpl implements AgendaService {
  private agenda: Agenda;
  private static instance: AgendaServiceImpl;

  private constructor() {
    this.agenda = new Agenda({ db: { address: Config.mongo.uri } });
  }

  public static getInstance(): AgendaServiceImpl {
    if (!AgendaServiceImpl.instance) {
      AgendaServiceImpl.instance = new AgendaServiceImpl();
    }
    return AgendaServiceImpl.instance;
  }

  async start(): Promise<void> {
    generalLogger.info("AGENDA: Starting Agenda");
    await this.agenda.start();
  }

  async stop(): Promise<void> {
    generalLogger.info("AGENDA: Stopping Agenda");
    await this.agenda.stop();
  }

  async scheduleJob(job: JobAttributesData): Promise<Job> {
    return this.agenda.create(job.name, job.data).schedule(job.schedule).save();
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.agenda.cancel({ _id: jobId });
  }
}

export default AgendaServiceImpl.getInstance();