"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type TaskType = "聊天任務" | "跟牌任務" | "馬逼任務" | "其他任務";

interface Mission {
  id: string;
  title: string;
  type: TaskType;
  desc: string;
  active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
}

interface HistoryRecord {
  id: string;
  username: string;
  mission_id?: string;
  mission_title?: string;
  mission_type?: TaskType;
  task?: TaskType;
  photos_count: number;
  photos?: string[];
  created_at: string;
  week: number;
  year: number;
}

const ADMIN_USERNAME = "chitu";
const ADMIN_PASSWORD = "1234567890";

function isDateInRange(startDate?: string | null, endDate?: string | null): boolean {
  // Use Asia/Taipei timezone for comparison
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  if (startDate && new Date(startDate) > now) return false;
  if (endDate && new Date(endDate) < now) return false;
  return true;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("聊天任務");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<HistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"missions" | "submissions">("missions");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<TaskType>("聊天任務");
  const [editDesc, setEditDesc] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  useEffect(() => {
    // Check if already logged in
    const authToken = localStorage.getItem("sun-task-admin-auth");
    if (authToken === "authenticated") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadMissions();
      loadSubmissions();
    }
  }, [authenticated]);

  async function loadMissions() {
    try {
      const res = await fetch("/api/missions");
      const data = await res.json();
      setMissions(data.missions || []);
    } catch (error) {
      console.error("Failed to load missions:", error);
      setMissions([]);
    }
  }

  async function loadSubmissions() {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Failed to load submissions:", error);
      setSubmissions([]);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    if (loginUsername === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
      localStorage.setItem("sun-task-admin-auth", "authenticated");
      setAuthenticated(true);
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setLoginError("帳號或密碼錯誤");
    }
  }

  function handleLogout() {
    localStorage.removeItem("sun-task-admin-auth");
    setAuthenticated(false);
    setLoginUsername("");
    setLoginPassword("");
  }

  async function createMission() {
    if (!title.trim() || !desc.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          desc: desc.trim(),
          active: true,
          start_date: startDate || null,
          end_date: endDate || null,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDesc("");
        setStartDate("");
        setEndDate("");
        await loadMissions();
      }
    } catch (error) {
      console.error("Failed to create mission:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(mission: Mission) {
    setLoading(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...mission,
          active: !mission.active,
        }),
      });

      if (res.ok) {
        await loadMissions();
      }
    } catch (error) {
      console.error("Failed to toggle mission:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeMission(id: string) {
    if (!confirm("確定要刪除此任務嗎？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/missions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadMissions();
      }
    } catch (error) {
      console.error("Failed to delete mission:", error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(m: Mission) {
    setEditingId(m.id);
    setEditTitle(m.title);
    setEditType(m.type);
    setEditDesc(m.desc);
    setEditStartDate(m.start_date || "");
    setEditEndDate(m.end_date || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditType("聊天任務");
    setEditDesc("");
    setEditStartDate("");
    setEditEndDate("");
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim() || !editDesc.trim() || loading) return;
    setLoading(true);
    try {
      const mission = missions.find((m) => m.id === id);
      if (!mission) return;

      const res = await fetch(`/api/missions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          type: editType,
          desc: editDesc.trim(),
          active: mission.active,
          start_date: editStartDate || null,
          end_date: editEndDate || null,
        }),
      });

      if (res.ok) {
        cancelEdit();
        await loadMissions();
      }
    } catch (error) {
      console.error("Failed to save mission:", error);
    } finally {
      setLoading(false);
    }
  }

  // Login form
  if (!authenticated) {
    return (
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#0f1629] via-[#111826] to-[#0b1326] text-slate-200">
        <div className="mx-auto max-w-md px-4 py-20">
          <div className="rounded-2xl border border-white/10 bg-white/2 p-6">
            <h1 className="text-2xl font-bold text-center mb-6">管理後台登入</h1>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm text-slate-300 mb-2">帳號</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                  placeholder="請輸入帳號"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-slate-300 mb-2">密碼</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                  placeholder="請輸入密碼"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {loginError && (
                <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-200 text-sm">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500/80 hover:bg-emerald-500 px-4 py-2 text-white transition disabled:opacity-50"
                disabled={!loginUsername.trim() || !loginPassword.trim()}
              >
                登入
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-slate-400 hover:text-slate-300">返回申請頁</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#0f1629] via-[#111826] to-[#0b1326] text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">管理後台</h1>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">返回申請頁</Link>
            <span className="text-slate-600">|</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              登出
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          <button
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "missions"
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("missions")}
          >
            任務管理
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "submissions"
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("submissions")}
          >
            申請記錄 ({submissions.length})
          </button>
        </div>

        {/* Missions tab */}
        {activeTab === "missions" && (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/2 p-5 mb-6">
              <div className="text-lg font-semibold mb-4">新增任務</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">任務標題</label>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                    placeholder="例如：本週儲值滿 1000 元"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">任務類型</label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                    value={type}
                    onChange={(e) => setType(e.target.value as TaskType)}
                  >
                    <option value="聊天任務">聊天任務</option>
                    <option value="跟牌任務">跟牌任務</option>
                    <option value="馬逼任務">馬逼任務</option>
                    <option value="其他任務">其他任務</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">開始時間（選填）</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">結束時間（選填）</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-300 mb-1">任務說明</label>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                  placeholder="描述任務的條件與說明..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  className="rounded-xl bg-emerald-500/80 hover:bg-emerald-500 px-4 py-2 text-white transition disabled:opacity-50"
                  onClick={createMission}
                  disabled={!title.trim() || !desc.trim() || loading}
                >
                  {loading ? "發佈中..." : "發佈任務"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
              <div className="text-lg font-semibold mb-4">任務列表</div>
              {missions.length === 0 ? (
                <div className="text-slate-400 text-sm">尚無任務</div>
              ) : (
                <ul className="space-y-3">
                  {missions.map((m) => {
                    const editing = editingId === m.id;
                    const expired = !isDateInRange(m.start_date, m.end_date);
                    return (
                      <li key={m.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
                        {editing ? (
                          <div>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">任務標題</label>
                                <input
                                  className="w-full rounded-lg border border-white/15 bg-[#0e1424] px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">任務類型</label>
                                <select
                                  className="w-full rounded-lg border border-white/15 bg-[#0e1424] px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                                  value={editType}
                                  onChange={(e) => setEditType(e.target.value as TaskType)}
                                >
                                  <option value="聊天任務">聊天任務</option>
                                  <option value="跟牌任務">跟牌任務</option>
                                  <option value="馬逼任務">馬逼任務</option>
                                  <option value="其他任務">其他任務</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">開始時間</label>
                                <input
                                  type="datetime-local"
                                  className="w-full rounded-lg border border-white/15 bg-[#0e1424] px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                                  value={editStartDate}
                                  onChange={(e) => setEditStartDate(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">結束時間</label>
                                <input
                                  type="datetime-local"
                                  className="w-full rounded-lg border border-white/15 bg-[#0e1424] px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                                  value={editEndDate}
                                  onChange={(e) => setEditEndDate(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-xs text-slate-400 mb-1">任務說明</label>
                              <textarea
                                className="w-full min-h-20 rounded-lg border border-white/15 bg-[#0e1424] px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg bg-emerald-500/80 hover:bg-emerald-500 px-3 py-1.5 text-sm text-white"
                                onClick={() => saveEdit(m.id)}
                                disabled={!editTitle.trim() || !editDesc.trim() || loading}
                              >
                                {loading ? "儲存中..." : "儲存"}
                              </button>
                              <button
                                className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/20"
                                onClick={cancelEdit}
                                disabled={loading}
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="font-semibold text-slate-100">{m.title}</div>
                                <div className="text-slate-400 text-sm mt-1">{m.desc}</div>
                                <div className="text-slate-500 text-xs mt-1">
                                  類型：{m.type}
                                  {m.start_date && (
                                    <>
                                      {" "}｜ 開始：{new Date(m.start_date).toLocaleString()}
                                    </>
                                  )}
                                  {m.end_date && (
                                    <>
                                      {" "}｜ 結束：{new Date(m.end_date).toLocaleString()}
                                    </>
                                  )}
                                  {expired && <span className="text-red-400"> ｜ 已過期</span>}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className={`rounded-md px-2 py-1 text-xs ${m.active ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-600/30 text-slate-300"}`}>
                                  {m.active ? "啟用" : "停用"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100 hover:bg-white/20 text-sm"
                                onClick={() => startEdit(m)}
                                disabled={loading}
                              >
                                編輯
                              </button>
                              <button
                                className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100 hover:bg-white/20 text-sm"
                                onClick={() => toggleActive(m)}
                                disabled={loading}
                              >
                                {m.active ? "停用" : "啟用"}
                              </button>
                              <button
                                className="rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-red-200 hover:bg-red-500/30 text-sm"
                                onClick={() => removeMission(m.id)}
                                disabled={loading}
                              >
                                刪除
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Submissions tab */}
        {activeTab === "submissions" && (
          <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
            <div className="text-lg font-semibold mb-4">申請記錄</div>
            {submissions.length === 0 ? (
              <div className="text-slate-400 text-sm">尚無申請記錄</div>
            ) : (
              <ul className="space-y-4">
                {submissions.map((s) => (
                  <li key={s.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-slate-500">申請帳號</div>
                        <div className="text-slate-100">{s.username}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">申請時間</div>
                        <div className="text-slate-100">{new Date(s.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">任務名稱</div>
                        <div className="text-slate-100">{s.mission_title || s.task || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">任務類型</div>
                        <div className="text-slate-100">{s.mission_type || s.task || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">週期</div>
                        <div className="text-slate-100">{s.year} 年 第 {s.week} 週</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">上傳照片數量</div>
                        <div className="text-slate-100">{s.photos_count} 張</div>
                      </div>
                    </div>
                    {s.photos && s.photos.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 mb-2">上傳照片</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {s.photos.map((photo, i) => (
                            <div key={i} className="rounded-lg overflow-hidden border border-white/10 bg-[#101728]">
                              <img src={photo} alt={`submission-${i}`} className="h-24 w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
