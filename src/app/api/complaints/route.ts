import { NextRequest, NextResponse } from "next/server";
import { complaintRepo } from "../../../../lib/complaintRepository";

//GET /api/complaints
export async function GET() {
  const list = await complaintRepo.listComplaints();
  return NextResponse.json(
    list.map((r: any) => ({
      id: r.getId(),
      studentName: r.getStudentName(),
      room: r.getRoom(),
      message: r.getMessage(),
      status: r.getStatus(),
      priority: r.getPriority(),
      badge: r.getSummaryBadge(),
    }))
  );
}

//POST /api/complaints
export async function POST(req: NextRequest) {
  const body = await req.json();

  const saved = await complaintRepo.createComplaint({
    studentName: body.studentName ?? "Anonymous",
    room: body.room ?? "",
    message: body.message ?? "",
    priority: body.priority ?? "normal",
  });

  return NextResponse.json(
    {
      id: saved.getId(),
      badge: saved.getSummaryBadge(),
    },
    { status: 201 }
  );
}

//PUT /api/complaints
export async function PUT(req: NextRequest) {
  const idParam = req.nextUrl.searchParams.get("id");
  const id = idParam ? parseInt(idParam, 10) : NaN;

  const body = await req.json();

  const updated = await complaintRepo.updateComplaint(id, {
    status: body.status,
    priority: body.priority,
    message: body.message,
  });

  return NextResponse.json({
    id: updated.getId(),
    status: updated.getStatus(),
    priority: updated.getPriority(),
    badge: updated.getSummaryBadge(),
  });
}

//DELETE /api/complaints
export async function DELETE(req: NextRequest) {
  const idParam = req.nextUrl.searchParams.get("id");
  const id = idParam ? parseInt(idParam, 10) : NaN;

  await complaintRepo.deleteComplaint(id);

  return NextResponse.json({ ok: true });
}
