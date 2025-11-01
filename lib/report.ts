export abstract class ReportBase {
  protected id?: number;
  protected studentName: string;
  protected room?: string | null; //allow null
  protected message: string;
  protected status: string;
  protected priority: string;
  protected createdAt?: Date;
  protected updatedAt?: Date;

  constructor(opts: {
    id?: number;
    studentName: string;
    room?: string | null; //allow null
    message: string;
    status?: string;
    priority?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = opts.id;
    this.studentName = opts.studentName;
    this.room = opts.room ?? null;
    this.message = opts.message;
    this.status = opts.status ?? "pending";
    this.priority = opts.priority ?? "normal";
    this.createdAt = opts.createdAt;
    this.updatedAt = opts.updatedAt;
  }


  getId() {
    return this.id;
  }

  getStudentName() {
    return this.studentName;
  }

  getRoom() {
    return this.room ?? "";
  }

  getMessage() {
    return this.message;
  }

  getStatus() {
    return this.status;
  }

  getPriority() {
    return this.priority;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  setStatus(newStatus: string) {
    const allowed = ["pending", "reviewing", "resolved"];
    if (!allowed.includes(newStatus)) {
      throw new Error("invalid status");
    }
    this.status = newStatus;
  }

  setPriority(newPriority: string) {
    const allowed = ["normal", "urgent"];
    if (!allowed.includes(newPriority)) {
      throw new Error("invalid priority");
    }
    this.priority = newPriority;
  }

  setMessage(newMsg: string) {
    this.message = newMsg;
  }

  abstract getSummaryBadge(): string;

  toPersistenceObject() {
    return {
      studentName: this.studentName,
      room: this.room ?? null,
      message: this.message,
      status: this.status,
      priority: this.priority,
    };
  }
}

export class NormalReport extends ReportBase {
  getSummaryBadge(): string {
    return `[NORMAL] ${this.getStudentName()} - ${this.getMessage().slice(
      0,
      30
    )}`;
  }
}

export class EmergencyReport extends ReportBase {
  getSummaryBadge(): string {
    return `🚨 URGENT: ${this.getStudentName()} - ${this.getMessage().slice(
      0,
      30
    )}`;
  }
}

export function makeReport(data: {
  id?: number;
  studentName: string;
  room?: string | null; 
  message: string;
  status?: string;
  priority?: string;
  createdAt?: Date;
  updatedAt?: Date;
}): ReportBase {
  const baseProps = {
    id: data.id,
    studentName: data.studentName,
    room: data.room ?? null,
    message: data.message,
    status: data.status ?? "pending",
    priority: data.priority ?? "normal",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  if (baseProps.priority === "urgent") {
    return new EmergencyReport(baseProps);
  } else {
    return new NormalReport(baseProps);
  }
}
