abstract class ReportBase {
  protected id?: number;
  protected studentName: string;
  protected room?: string;
  protected message: string;
  protected status: string;
  protected priority: string;

  constructor(params: {
    id?: number;
    studentName: string;
    room?: string;
    message: string;
    status?: string;
    priority?: string;
  }) {
    this.id = params.id;
    this.studentName = params.studentName;
    this.room = params.room;
    this.message = params.message;
    this.status = params.status ?? "pending";
    this.priority = params.priority ?? "normal";
  }

  public getId(): number | undefined {
    return this.id;
  }
  public getStudentName(): string {
    return this.studentName;
  }
  public getRoom(): string | undefined {
    return this.room;
  }
  public getMessage(): string {
    return this.message;
  }
  public getStatus(): string {
    return this.status;
  }
  public setStatus(newStatus: string) {
    const allowed = ["pending", "reviewing", "resolved"];
    if (!allowed.includes(newStatus)) {
      throw new Error("Invalid status");
    }
    this.status = newStatus;
  }
  public getPriority(): string {
    return this.priority;
  }
  public setPriority(newPriority: string) {
    const allowed = ["normal", "urgent"];
    this.priority = allowed.includes(newPriority) ? newPriority : "normal";
  }

  public abstract getSummaryBadge(): string;

  public toPersistenceObject() {
    return {
      studentName: this.studentName,
      room: this.room,
      message: this.message,
      status: this.status,
      priority: this.priority,
    };
  }
}

class NormalReport extends ReportBase {
  public getSummaryBadge(): string {
    return `[NORMAL] ${this.getStudentName()}: ${this.getMessage().slice(
      0,
      20
    )}...`;
  }
}

class EmergencyReport extends ReportBase {
  public getSummaryBadge(): string {
    return `[URGENT🔥] ${this.getStudentName()}: ${this.getMessage().slice(
      0,
      20
    )}...`;
  }
}

export function makeReport(params: {
  id?: number;
  studentName: string;
  room?: string;
  message: string;
  status?: string;
  priority?: string;
}): ReportBase {
  if (params.priority === "urgent") {
    return new EmergencyReport(params);
  }
  return new NormalReport(params);
}

export type { ReportBase };
