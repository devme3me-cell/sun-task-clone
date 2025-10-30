"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";

type TaskType = "聊天任務" | "跟牌任務" | "馬逼任務" | "其他任務";

interface Mission {
  id: string;
  title: string;
  type: TaskType;
  desc: string;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface HistoryRecord {
  id: string;
  username: string;
  missionId?: string;
  missionTitle?: string;
  missionType?: TaskType;
  task?: TaskType;
  photosCount: number;
  photos?: string[];
  createdAt: string;
  week: number;
  year: number;
}

function getWeekNumber(date: Date) {
  // Get current time in Asia/Taipei timezone
  const taipeiDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));

  // ISO week number calculation
  const tmp = new Date(Date.UTC(taipeiDate.getFullYear(), taipeiDate.getMonth(), taipeiDate.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNum, year: tmp.getUTCFullYear() };
}

function isDateInRange(startDate?: string | null, endDate?: string | null): boolean {
  // Use Asia/Taipei timezone for comparison
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  if (startDate) {
    const start = new Date(startDate);
    if (start > now) {
      console.log("Mission not started yet. Start:", start, "Now:", now);
      return false;
    }
  }
  if (endDate) {
    const end = new Date(endDate);
    if (end < now) {
      console.log("Mission expired. End:", end, "Now:", now);
      return false;
    }
  }
  return true;
}

// Convert snake_case keys to camelCase for internal use
function mapMissionFromApi(m: {
  id: string;
  title: string;
  type: TaskType;
  desc: string;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}): Mission {
  return {
    id: m.id,
    title: m.title,
    type: m.type,
    desc: m.desc,
    active: m.active,
    startDate: m.start_date || undefined,
    endDate: m.end_date || undefined,
    createdAt: m.created_at,
  };
}

function mapHistoryFromApi(r: {
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
}): HistoryRecord {
  return {
    id: r.id,
    username: r.username,
    missionId: r.mission_id,
    missionTitle: r.mission_title,
    missionType: r.mission_type,
    task: r.task,
    photosCount: r.photos_count,
    photos: r.photos,
    createdAt: r.created_at,
    week: r.week,
    year: r.year,
  };
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyUser, setHistoryUser] = useState("");
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const { week, year } = useMemo(() => getWeekNumber(new Date()), []);

  useEffect(() => {
    // Load missions from API, filter by active and date range
    async function fetchMissions() {
      try {
        const res = await fetch("/api/missions");
        const data = await res.json();
        console.log("API Response:", data);
        if (data.missions && Array.isArray(data.missions)) {
          console.log("Total missions from API:", data.missions.length);
          const filtered = data.missions.filter(
            (m: {
              title?: string;
              active?: boolean;
              start_date?: string | null;
              end_date?: string | null;
            }) => {
              const isActive = m.active ?? true;
              const inRange = isDateInRange(m.start_date, m.end_date);
              console.log("Mission:", m.title, "Active:", isActive, "InRange:", inRange);
              return m && isActive && inRange;
            }
          );
          console.log("Filtered missions:", filtered.length);
          setMissions(filtered.map(mapMissionFromApi));
        }
      } catch (error) {
        console.error("Failed to load missions:", error);
        setMissions([]);
      }
    }
    fetchMissions();
  }, []);

  function nextStep(target: number) {
    setLoading(true);
    setTimeout(() => {
      setStep(target);
      setLoading(false);
    }, 350);
  }

  function previousStep(target: number) {
    nextStep(target);
  }

  function confirmAccount() {
    if (!username.trim()) return;
    nextStep(2);
  }

  function selectTask() {
    if (!selectedMission) return;
    nextStep(3);
  }

  async function submitApplication() {
    if (!photos.length || !selectedMission) return;

    // Convert blob URLs to base64 for persistence
    const photoPromises = photos.map((url) => {
      return new Promise<string>((resolve) => {
        fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
          .catch(() => resolve(""));
      });
    });

    const base64Photos = await Promise.all(photoPromises);

    // Submit to API
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          mission_id: selectedMission.id,
          mission_title: selectedMission.title,
          mission_type: selectedMission.type,
          photos: base64Photos.filter(Boolean),
          photos_count: photos.length,
          week,
          year,
        }),
      });

      if (res.ok) {
        nextStep(4);
      } else {
        console.error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  }

  function onFilesSelected(files: FileList | null) {
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      urls.push(url);
    });
    if (urls.length) setPhotos((prev) => [...prev, ...urls]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  }

  function openHistory() {
    setHistoryUser(username);
    setHistoryList([]);
    setShowHistory(true);
  }
  function closeHistory() {
    setShowHistory(false);
  }
  async function loadApplicationHistory() {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      const list: HistoryRecord[] = Array.isArray(data.submissions)
        ? data.submissions.map(mapHistoryFromApi)
        : [];
      const filtered = historyUser.trim()
        ? list.filter((r) => r.username === historyUser.trim())
        : list;
      setHistoryList(filtered);
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistoryList([]);
    }
  }

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#0f1629] via-[#111826] to-[#0b1326] text-slate-200">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Top-right actions */}
        <div className="mb-4 flex justify-end gap-2">
          <button
            className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-slate-100 transition"
            onClick={openHistory}
          >
            申請記錄
          </button>
          <Link
            href="/admin"
            className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-slate-100 transition"
          >
            管理後台
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
            龍伍團隊每週任務申請
          </h1>
          <p className="text-slate-400 mt-1">完成每週任務，領取各種彩金！！</p>
        </div>

        {/* Step indicator */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { n: 1, t: "帳號確認" },
            { n: 2, t: "選擇任務" },
            { n: 3, t: "上傳證明" },
            { n: 4, t: "完成申請" },
          ].map((s) => (
            <div
              key={s.n}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 border ${
                step === s.n
                  ? "bg-white/5 border-emerald-500/50"
                  : "bg-white/2 border-white/10"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                  step === s.n ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300"
                }`}
              >
                {s.n}
              </div>
              <div className={`text-sm ${step === s.n ? "text-slate-100" : "text-slate-400"}`}>{s.t}</div>
            </div>
          ))}
        </div>

        {/* Week info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4">
            <div className="text-sm text-slate-400">當前週期（台灣時區）</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[#d9fa60] text-xl font-bold">第 {week} 週</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 text-lg font-semibold">{year} 年</span>
            </div>
            <div className="mt-1 text-slate-500 text-sm">本週任務申請截止時間：週日 23:59 (GMT+8)</div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="my-6 flex flex-col items-center justify-center gap-2 text-emerald-400">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <div className="text-slate-300">處理中...</div>
          </div>
        )}

        {/* Sections */}
        {/* Section 1: Account confirmation */}
        {step === 1 && (
          <section className="rounded-2xl border border-white/10 bg-white/2 p-5">
            <label className="block text-sm text-slate-300 mb-2">請輸入您的3A/大老爺帳號</label>
            <input
              className="w-full rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
              placeholder="請輸入帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="mt-5 flex justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 px-4 py-2 text-white transition"
                onClick={confirmAccount}
                disabled={!username.trim()}
              >
                確認帳號
              </button>
            </div>
          </section>
        )}

        {/* Section 2: Choose task (missions) */}
        {step === 2 && (
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">任務公告板</h3>
              <div className="text-slate-400 text-sm">選擇任務開始你的冒險</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/2 p-4 mb-4">
              <div className="text-sm text-slate-300 mb-3">任務類型說明</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "聊天任務", desc: "聊天室互動任務", color: "text-blue-400" },
                  { label: "跟牌任務", desc: "跟隨下注任務", color: "text-violet-400" },
                  { label: "馬逼任務", desc: "特殊挑戰任務", color: "text-emerald-400" },
                  { label: "其他任務", desc: "其他類型任務", color: "text-amber-400" },
                ].map((q) => (
                  <div key={q.label} className="rounded-xl bg-white/3 p-3 border border-white/10">
                    <div className={`font-semibold ${q.color}`}>{q.label}</div>
                    <div className="text-slate-400 text-sm mt-1">{q.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <label className="block text-sm text-slate-300 mb-2">選擇你的任務</label>
            {missions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/2 p-4 text-slate-400 text-sm">
                目前沒有任務可選，請稍後再試或聯繫管理員。
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {missions.map((m) => {
                  const active = selectedMission?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMission(m)}
                      className={`text-left rounded-2xl border p-4 transition ${
                        active
                          ? "border-emerald-500/60 bg-emerald-500/10"
                          : "border-white/10 bg-white/2 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-100">{m.title}</div>
                          <div className="text-slate-400 text-sm mt-1">{m.desc}</div>
                        </div>
                        <span className="shrink-0 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-slate-300">
                          {m.type}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2 text-slate-100 transition"
                onClick={() => previousStep(1)}
              >
                上一步
              </button>
              <button
                className="rounded-xl bg-blue-500/80 hover:bg-blue-500 px-4 py-2 text-white transition disabled:opacity-50"
                onClick={selectTask}
                disabled={!selectedMission}
              >
                下一步
              </button>
            </div>
          </section>
        )}

        {/* Section 3: Upload proof */}
        {step === 3 && selectedMission && (
          <section>
            <div className="rounded-2xl border border-white/10 bg-white/2 p-4 mb-4">
              <div className="text-sm text-slate-300 mb-1">任務資訊</div>
              <div className="text-slate-400 text-sm">
                帳號：<span className="text-slate-200">{username}</span>； 任務：
                <span className="text-slate-200">{selectedMission.title}</span>（
                <span className="text-slate-200">{selectedMission.type}</span>）； 週期：
                <span className="text-slate-200">{year} 年 第 {week} 週</span>
              </div>
            </div>

            <div className="mb-2 text-sm text-slate-300">上傳證明照片</div>
            <label
              htmlFor="photoInput"
              className={`block rounded-2xl border border-dashed p-6 text-center cursor-pointer transition ${
                dragActive
                  ? "border-emerald-500/60 bg-emerald-500/5"
                  : "border-white/20 bg-white/2 hover:border-emerald-500/60 hover:bg-white/5"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
                onFilesSelected(e.dataTransfer.files);
              }}
            >
              <div className="text-3xl mb-1">🖼️</div>
              <div className="text-slate-200">點擊或拖拽上傳照片</div>
              <div className="text-slate-500 text-sm mt-1">支援 JPG, PNG 格式，可上傳多張</div>
            </label>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onFilesSelected(e.target.files)}
            />

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((src, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#101728]">
                    <img src={src} alt={`proof-${i}`} className="h-36 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 hidden rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur group-hover:block hover:bg-black/70"
                      onClick={() => removePhoto(i)}
                      aria-label="刪除圖片"
                    >
                      刪除
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2 text-slate-100 transition"
                onClick={() => previousStep(2)}
              >
                上一步
              </button>
              <button
                className="rounded-xl bg-emerald-500/80 hover:bg-emerald-500 px-4 py-2 text-white transition disabled:opacity-50"
                onClick={submitApplication}
                disabled={!photos.length}
              >
                提交申請
              </button>
            </div>
          </section>
        )}

        {/* Section 4: Success */}
        {step === 4 && (
          <section>
            <div
              className="rounded-2xl border p-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.15) 100%)",
                borderColor: "rgba(16,185,129,0.3)",
              }}
            >
              <h2 className="text-2xl font-semibold text-emerald-400 mb-2">申請提交成功！</h2>
              <p className="text-slate-400 mb-1">您的任務申請已提交，我們會盡快審核。</p>
              <p className="text-slate-400">審核通過後將自動發放獎勵到您的帳戶。</p>
            </div>

            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(79,70,229,0.1) 100%)",
                borderColor: "rgba(16,185,129,0.3)",
              }}
            >
              <div className="text-emerald-400 mb-2">下一個任務提示</div>
              <div className="text-slate-300 text-sm">
                完成本次任務後，您還可以申請以下任務：<br />
                <span className="text-slate-400">儲值任務、託售任務、流水任務</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="rounded-xl bg-blue-500/80 hover:bg-blue-500 px-4 py-2 text-white transition"
                onClick={() => {
                  // reset all state for new application
                  setUsername("");
                  setSelectedMission(null);
                  photos.forEach((p) => URL.revokeObjectURL(p));
                  setPhotos([]);
                  nextStep(1);
                }}
              >
                申請其他任務
              </button>
            </div>
          </section>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={closeHistory} />
            <div className="relative z-10 w-[92%] max-w-2xl rounded-2xl border border-white/10 bg-[#0f1526] p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">申請記錄</h2>
                <button className="text-slate-400 hover:text-slate-200" onClick={closeHistory}>×</button>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 rounded-xl border border-white/15 bg-[#0e1424] px-3 py-2 text-slate-100 outline-none focus:border-emerald-500/60"
                  placeholder="請輸入帳號查詢申請記錄"
                  value={historyUser}
                  onChange={(e) => setHistoryUser(e.target.value)}
                />
                <button
                  className="rounded-xl bg-emerald-500/70 hover:bg-emerald-500/90 px-4 py-2 text-white transition"
                  onClick={loadApplicationHistory}
                >
                  查詢
                </button>
              </div>
              <div>
                {historyList.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/2 p-4 text-center text-slate-400">
                    請輸入帳號查詢申請記錄
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {historyList.map((r) => (
                      <li key={r.id} className="rounded-xl border border-white/10 bg-white/2 p-4">
                        <div className="text-slate-300 text-sm">帳號：<span className="text-slate-100">{r.username}</span></div>
                        <div className="text-slate-300 text-sm">任務：<span className="text-slate-100">{r.missionTitle || r.task}</span></div>
                        <div className="text-slate-300 text-sm">類型：<span className="text-slate-100">{r.missionType || "-"}</span></div>
                        <div className="text-slate-300 text-sm">週期：
                          <span className="text-slate-100">{r.year} 年 第 {r.week} 週</span>
                        </div>
                        <div className="text-slate-300 text-sm">上傳照片：<span className="text-slate-100">{r.photosCount} 張</span></div>
                        <div className="text-slate-300 text-sm">申請時間：<span className="text-slate-100">{new Date(r.createdAt).toLocaleString()}</span></div>
                        {r.photos && r.photos.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {r.photos.map((src, idx) => (
                              <img
                                key={idx}
                                src={src}
                                alt={`history-proof-${idx}`}
                                className="h-20 w-full object-cover rounded-md border border-white/10"
                              />
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
