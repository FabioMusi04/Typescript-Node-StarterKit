import { Job, JobAttributesData, Agenda } from "agenda";
import Config from "../../config.ts";

export interface AgendaService {
  start(): Promise<void>;
  stop(): Promise<void>;
  scheduleJob(job: JobAttributesData): Promise<Job>;
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
    await this.agenda.start();
  }

  async stop(): Promise<void> {
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