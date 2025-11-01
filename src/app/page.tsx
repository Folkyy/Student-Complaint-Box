"use client";

import { useEffect, useState } from "react";

type ComplaintView = {
  id: number | undefined;
  studentName: string;
  room?: string;
  message: string;
  status: string;
  priority: string;
  badge: string;
};

export default function HomePage() {
  const [complaints, setComplaints] = useState<ComplaintView[]>([]);
  const [formName, setFormName] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formPriority, setFormPriority] = useState("normal");

  //edit mode
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("pending");
  const [editPriority, setEditPriority] = useState("normal");
  const [editMsg, setEditMsg] = useState("");

  async function loadData() {
    const res = await fetch("/api/complaints");
    const data = await res.json();
    setComplaints(data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: formName,
        room: formRoom,
        message: formMsg,
        priority: formPriority,
      }),
    });

    setFormName("");
    setFormRoom("");
    setFormMsg("");
    setFormPriority("normal");

    await loadData();
  }

  async function handleDelete(id: number | undefined) {
    if (!id) return;
    if (!confirm("Delete this complaint?")) return;
    await fetch(`/api/complaints?id=${id}`, {
      method: "DELETE",
    });
    await loadData();
  }

  function startEdit(c: ComplaintView) {
    setEditId(c.id ?? null);
    setEditStatus(c.status);
    setEditPriority(c.priority);
    setEditMsg(c.message);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (editId == null) return;
    await fetch(`/api/complaints?id=${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: editStatus,
        priority: editPriority,
        message: editMsg,
      }),
    });
    setEditId(null);
    await loadData();
  }

  function statusChip(status: string) {
    const colorMap: Record<string, string> = {
      pending: "#facc15", //yellow
      reviewing: "#38bdf8", //sky blue
      resolved: "#4ade80", //green
    };
    return (
      <span
        style={{
          display: "inline-block",
          backgroundColor: colorMap[status] || "#a3a3a3",
          color: "#000",
          fontSize: "11px",
          fontWeight: 600,
          lineHeight: 1,
          padding: "4px 6px",
          borderRadius: "6px",
        }}
      >
        {status}
      </span>
    );
  }

  function priorityChip(priority: string) {
    const colorMap: Record<string, string> = {
      normal: "#52525b", 
      urgent: "#ef4444", 
    };
    return (
      <span
        style={{
          display: "inline-block",
          backgroundColor: colorMap[priority] || "#737373",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 600,
          lineHeight: 1,
          padding: "4px 6px",
          borderRadius: "6px",
        }}
      >
        {priority}
      </span>
    );
  }

  //RENDER 
  return (
    <div style={pageBg}>
      <header style={headerBar}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>
          🏫 Student Complaint Dashboard
        </div>
      </header>

      <main style={layoutWrap}>
        {/* LEFT: TABLE */}
        <section style={leftCol}>
          <div style={panelCard}>
            <div style={panelHeaderRow}>
              <div>
                <div style={panelTitle}>Complaints</div>
                <div style={panelSubtitle}>
                  All recent issues reported by students.
                </div>
              </div>
              <div style={countBubble}>{complaints.length}</div>
            </div>

            <div style={tableWrap}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thCell}>Issue</th>
                    <th style={thCellSm}>Status</th>
                    <th style={thCellSm}>Priority</th>
                    <th style={thCellSm}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id} style={rowStyle}>
                      {/* Issue column */}
                      <td style={tdMain}>
                        <div style={issueTopRow}>
                          <span style={studentNameText}>
                            {c.studentName || "Unknown"}
                          </span>
                          <span style={roomTag}>
                            {c.room ? `Room ${c.room}` : "No room"}
                          </span>
                        </div>

                        <div style={msgText}>{c.message}</div>

                        <div style={badgeText}>{c.badge}</div>
                      </td>

                      {/* Status */}
                      <td style={tdCell}>{statusChip(c.status)}</td>

                      {/* Priority */}
                      <td style={tdCell}>{priorityChip(c.priority)}</td>

                      {/* Actions */}
                      <td style={tdCell}>
                        <div style={actionCol}>
                          <button
                            style={btnGhost}
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            style={btnDanger}
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {complaints.length === 0 && (
                    <tr>
                      <td style={tdEmpty} colSpan={4}>
                        <div style={{ textAlign: "center", opacity: 0.5 }}>
                          No complaints yet.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RIGHT: FORM */}
        <aside style={rightCol}>
          <div style={panelCard}>
            {editId === null ? (
              <>
                <div style={panelHeaderCol}>
                  <div style={panelTitle}>New Complaint</div>
                  <div style={panelSubtitle}>
                    Students submit problems here. Admin will review.
                  </div>
                </div>

                <form style={formGrid} onSubmit={handleCreate}>
                  <label style={fieldBlock}>
                    <span style={labelText}>Your name</span>
                    <input
                      style={inputBox}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </label>

                  <label style={fieldBlock}>
                    <span style={labelText}>Room (optional)</span>
                    <input
                      style={inputBox}
                      value={formRoom}
                      onChange={(e) => setFormRoom(e.target.value)}
                    />
                  </label>

                  <label style={fieldBlock}>
                    <span style={labelText}>Message / Problem</span>
                    <textarea
                      style={inputBox}
                      rows={4}
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      required
                    />
                  </label>

                  <label style={fieldBlock}>
                    <span style={labelText}>Priority</span>
                    <select
                      style={inputBox}
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                    >
                      <option value="normal">normal</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </label>

                  <button style={btnPrimary} type="submit">
                    Submit Complaint
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={panelHeaderCol}>
                  <div style={panelTitle}>Edit Complaint #{editId}</div>
                  <div style={panelSubtitle}>
                    Update status / priority / message.
                  </div>
                </div>

                <form style={formGrid} onSubmit={handleUpdate}>
                  <label style={fieldBlock}>
                    <span style={labelText}>Status</span>
                    <select
                      style={inputBox}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="pending">pending</option>
                      <option value="reviewing">reviewing</option>
                      <option value="resolved">resolved</option>
                    </select>
                  </label>

                  <label style={fieldBlock}>
                    <span style={labelText}>Priority</span>
                    <select
                      style={inputBox}
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="normal">normal</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </label>

                  <label style={fieldBlock}>
                    <span style={labelText}>Message</span>
                    <textarea
                      style={inputBox}
                      rows={4}
                      value={editMsg}
                      onChange={(e) => setEditMsg(e.target.value)}
                    />
                  </label>

                  <button style={btnPrimary} type="submit">
                    Save changes
                  </button>

                  <button
                    style={btnGhost}
                    type="button"
                    onClick={() => setEditId(null)}
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
        </aside>
      </main>

      <footer style={footerBar}></footer>
    </div>
  );
}

//STYLES

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(160deg,#1f2937 0%,#0f172a 60%)", // gray-800 -> gray-900
  color: "#fff",
  display: "flex",
  flexDirection: "column",
};

const headerBar: React.CSSProperties = {
  padding: "16px 24px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background:
    "radial-gradient(circle at 0% 0%, rgba(96,165,250,0.18) 0%, rgba(0,0,0,0) 60%)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const footerBar: React.CSSProperties = {
  marginTop: "auto",
  padding: "12px 24px 20px",
  textAlign: "center",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background:
    "radial-gradient(circle at 100% 100%, rgba(250,204,21,0.15) 0%, rgba(0,0,0,0) 60%)",
};

const layoutWrap: React.CSSProperties = {
  display: "grid",
  gap: "24px",
  gridTemplateColumns: "minmax(0,1fr) 320px",
  padding: "24px",
  maxWidth: "1200px",
  width: "100%",
  margin: "0 auto",
};

const leftCol: React.CSSProperties = {
  minWidth: 0,
};

const rightCol: React.CSSProperties = {
  minWidth: 0,
};

const panelCard: React.CSSProperties = {
  backgroundColor: "rgba(15,23,42,0.8)", 
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "16px",
  padding: "16px 20px 20px",
  boxShadow:
    "0 30px 80px rgba(0,0,0,0.8), 0 2px 4px rgba(255,255,255,0.06) inset",
  color: "#fff",
  minHeight: 0,
};

const panelHeaderRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "16px",
  gap: "12px",
};

const panelHeaderCol: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "16px",
  gap: "4px",
};

const panelTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#fff",
};

const panelSubtitle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.5)",
  lineHeight: 1.4,
};

const countBubble: React.CSSProperties = {
  minWidth: "32px",
  height: "32px",
  background:
    "radial-gradient(circle at 30% 30%, #4ade80 0%, #065f46 70%)", // green pop
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: "32px",
  textAlign: "center",
  color: "#000",
  boxShadow: "0 10px 20px rgba(16,185,129,0.4)",
  padding: "0 8px",
};

const tableWrap: React.CSSProperties = {
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.07)",
  backgroundColor: "rgba(0,0,0,0.2)",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
  color: "#fff",
};

const thCell: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontWeight: 500,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "rgba(255,255,255,0.5)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(15,23,42,0.6)",
  whiteSpace: "nowrap",
};

const thCellSm: React.CSSProperties = {
  ...thCell,
  width: "1%",
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  verticalAlign: "top",
};

const tdMain: React.CSSProperties = {
  padding: "12px 16px",
  lineHeight: 1.4,
  verticalAlign: "top",
};

const issueTopRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "6px",
  marginBottom: "4px",
};

const studentNameText: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#fff",
};

const roomTag: React.CSSProperties = {
  backgroundColor: "rgba(96,165,250,0.15)",
  border: "1px solid rgba(96,165,250,0.4)",
  color: "#bae6fd",
  fontSize: "11px",
  lineHeight: 1,
  padding: "3px 6px",
  borderRadius: "6px",
};

const msgText: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.85)",
  marginBottom: "4px",
  wordBreak: "break-word",
};

const badgeText: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.4)",
  fontStyle: "italic",
  wordBreak: "break-word",
};

const tdCell: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "12px",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};

const tdEmpty: React.CSSProperties = {
  padding: "40px 16px",
  fontSize: "12px",
  color: "rgba(255,255,255,0.6)",
};

const actionCol: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const btnPrimary: React.CSSProperties = {
  background:
    "radial-gradient(circle at 20% 20%, #4ade80 0%, #065f46 70%)", //green
  color: "#000",
  fontSize: "13px",
  fontWeight: 600,
  border: "0",
  borderRadius: "8px",
  padding: "10px 12px",
  cursor: "pointer",
  boxShadow:
    "0 12px 30px rgba(16,185,129,0.45), 0 2px 2px rgba(0,0,0,0.8) inset",
  textAlign: "center",
};

const btnGhost: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.07)",
  color: "#fff",
  fontSize: "12px",
  fontWeight: 500,
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "8px",
  padding: "8px 10px",
  lineHeight: 1.2,
  cursor: "pointer",
  textAlign: "center",
};

const btnDanger: React.CSSProperties = {
  background:
    "radial-gradient(circle at 20% 20%, #ef4444 0%, #7f1d1d 70%)", //red
  color: "#fff",
  fontSize: "12px",
  fontWeight: 600,
  border: "0",
  borderRadius: "8px",
  padding: "8px 10px",
  lineHeight: 1.2,
  cursor: "pointer",
  textAlign: "center",
  boxShadow:
    "0 12px 30px rgba(239,68,68,0.4), 0 2px 2px rgba(0,0,0,0.8) inset",
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  fontSize: "13px",
};

const fieldBlock: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const labelText: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.7)",
  fontWeight: 500,
};

const inputBox: React.CSSProperties = {
  width: "100%",
  fontSize: "13px",
  lineHeight: 1.4,
  backgroundColor: "rgba(0,0,0,0.4)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "8px",
  padding: "8px 10px",
  fontFamily: "inherit",
  outline: "none",
};
