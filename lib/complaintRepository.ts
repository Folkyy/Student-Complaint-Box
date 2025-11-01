import { prisma } from "./prisma";
import { makeReport, ReportBase } from "./report";

export class ComplaintRepository {
  //CREATE 
  async createComplaint(data: {
    studentName: string;
    room?: string;
    message: string;
    priority?: string;
  }): Promise<ReportBase> {
    const reportObj = makeReport({
      studentName: data.studentName,
      room: data.room,
      message: data.message,
      priority: data.priority ?? "normal",
      status: "pending",
    });

    const saved = await prisma.complaint.create({
      data: reportObj.toPersistenceObject(),
    });

    return makeReport({ ...saved });
  }

  //READ
  async listComplaints(): Promise<ReportBase[]> {
    const rows = await prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row: any) => makeReport({ ...row }));
  }

  //UPDATE
  async updateComplaint(
    id: number,
    data: {
      status?: string;
      priority?: string;
      message?: string;
    }
  ): Promise<ReportBase> {
    const original = await prisma.complaint.findUniqueOrThrow({
      where: { id },
    });

    const reportObj = makeReport({ ...original });

    //apply change  
    if (data.status) {
      reportObj.setStatus(data.status);
    }
    if (data.priority) {
      reportObj.setPriority(data.priority);
    }
    if (data.message) {
      (reportObj as any).message = data.message;
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: reportObj.toPersistenceObject(),
    });

    return makeReport(updated);
  }

  //DELETE
  async deleteComplaint(id: number): Promise<void> {
    await prisma.complaint.delete({
      where: { id },
    });
  }
}

//singleton instance
export const complaintRepo = new ComplaintRepository();
