"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const HOME_DICT = {
  th: {
    badge: "เกมผู้ช่วย Avalon",
    title: "Avalon Companion",
    subtitle: "จัดการห้องและเข้าร่วมเกมได้ง่ายขึ้นในไม่กี่คลิก",
    playerBtn: "เข้าเล่นเกม",
    playerDesc: "สำหรับผู้เล่นที่มีรหัสห้องแล้ว",
    modBtn: "จัดการห้อง",
    modDesc: "สำหรับผู้ดูแลห้อง สร้างและควบคุมเกม",
    joinTitle: "เข้าร่วมเกม",
    joinSubtitle: "ใส่รหัสห้อง 6 หลักเพื่อเข้าสู่เกม",
    roomCodePlaceholder: "กรอก Room Code",
    joinRoomBtn: "เข้าสู่ห้อง",
    backBtn: "กลับ",
    modTitle: "ระบบจัดการห้อง",
    modSubtitle: "สร้างห้องใหม่ หรือกลับเข้าห้องเดิมของคุณ",
    createRoomBtn: "สร้างห้องใหม่",
    or: "หรือ",
    rejoinPlaceholder: "กรอก Code เพื่อกลับเข้าห้อง",
    rejoinBtn: "กลับเข้าห้องเดิม",
    checking: "กำลังตรวจสอบ...",
    creating: "กำลังสร้างห้อง...",
    errorCreate: "เกิดข้อผิดพลาดในการสร้างห้อง กรุณาลองใหม่",
    errorNotFound: "ไม่พบห้องนี้ กรุณาตรวจสอบรหัสอีกครั้ง",
    errorJoin: "ไม่พบห้องนี้ หรือรหัสไม่ถูกต้อง",
    helper: "Room Code ต้องมี 6 ตัวอักษร",
    th: "ไทย",
    en: "English"
  },
  en: {
    badge: "Avalon game companion",
    title: "Avalon Companion",
    subtitle: "Manage rooms and join games in just a few clicks",
    playerBtn: "Join Game",
    playerDesc: "For players who already have a room code",
    modBtn: "Manage Room",
    modDesc: "For moderators to create and control a game",
    joinTitle: "Join a Game",
    joinSubtitle: "Enter your 6-digit room code to continue",
    roomCodePlaceholder: "Enter Room Code",
    joinRoomBtn: "Join Room",
    backBtn: "Back",
    modTitle: "Room Management",
    modSubtitle: "Create a new room or rejoin your existing one",
    createRoomBtn: "Create New Room",
    or: "OR",
    rejoinPlaceholder: "Enter Code to Rejoin",
    rejoinBtn: "Rejoin Existing Room",
    checking: "Checking...",
    creating: "Creating room...",
    errorCreate: "Error creating room. Please try again.",
    errorNotFound: "Room not found. Please check the code.",
    errorJoin: "Room not found or code is incorrect.",
    helper: "Room code must be 6 characters",
    th: "ไทย",
    en: "English"
  }
};

const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function Home() {
  const router = useRouter();

  const [view, setView] = useState<"home" | "mod" | "player">("home");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [lang, setLang] = useState<"th" | "en">("th");
  const t = HOME_DICT[lang];

  useEffect(() => {
    const savedLang =
      typeof window !== "undefined"
        ? localStorage.getItem("avalon_lang")
        : null;
    if (savedLang === "en" || savedLang === "th") setLang(savedLang);
  }, []);

  const changeLang = (newLang: "th" | "en") => {
    setLang(newLang);
    localStorage.setItem("avalon_lang", newLang);
  };

  const resetState = () => {
    setError("");
    setRoomCode("");
    setIsLoading(false);
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setRoomCode(cleaned);
    if (error) setError("");
  };

  const handleCreateRoom = async () => {
    setError("");
    setIsLoading(true);

    const newCode = generateCode();

    const { error: insertError } = await supabase
      .from("rooms")
      .insert([{ code: newCode }]);

    if (insertError) {
      setError(t.errorCreate);
      setIsLoading(false);
      return;
    }

    router.push(`/room/${newCode}?mod=true`);
  };

  const handleRejoinAsMod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleanCode = roomCode.trim().toUpperCase();

    const { data, error: fetchError } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", cleanCode)
      .single();

    if (fetchError || !data) {
      setError(t.errorNotFound);
      setIsLoading(false);
      return;
    }

    router.push(`/room/${cleanCode}?mod=true`);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleanCode = roomCode.trim().toUpperCase();

    const { data, error: fetchError } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", cleanCode)
      .single();

    if (fetchError || !data) {
      setError(t.errorJoin);
      setIsLoading(false);
      return;
    }

    router.push(`/room/${cleanCode}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(to_bottom,_#020617,_#0f172a)]" />
      <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Language Switch */}
          <div className="mb-6 flex justify-end">
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              <button
                onClick={() => changeLang("th")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  lang === "th"
                    ? "bg-white text-slate-900 shadow"
                    : "text-white/70 hover:text-white"
                }`}
              >
                🇹🇭 {t.th}
              </button>
              <button
                onClick={() => changeLang("en")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  lang === "en"
                    ? "bg-white text-slate-900 shadow"
                    : "text-white/70 hover:text-white"
                }`}
              >
                🇬🇧 {t.en}
              </button>
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200">
                {t.badge}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {t.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
                {t.subtitle}
              </p>
            </div>

            {/* HOME */}
            {view === "home" && (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    resetState();
                    setView("player");
                  }}
                  className="group w-full rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-blue-500/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-white">
                        🎮 {t.playerBtn}
                      </div>
                      <p className="mt-1 text-sm text-blue-100/90">
                        {t.playerDesc}
                      </p>
                    </div>
                    <span className="text-2xl transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    resetState();
                    setView("mod");
                  }}
                  className="group w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-white">
                        🛡️ {t.modBtn}
                      </div>
                      <p className="mt-1 text-sm text-slate-300">
                        {t.modDesc}
                      </p>
                    </div>
                    <span className="text-2xl text-white/80 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* PLAYER */}
            {view === "player" && (
              <form onSubmit={handleJoinRoom} className="space-y-5">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">{t.joinTitle}</h2>
                  <p className="mt-2 text-sm text-slate-300">{t.joinSubtitle}</p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={t.roomCodePlaceholder}
                    value={roomCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-center text-2xl font-bold uppercase tracking-[0.35em] text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                  <p className="text-center text-xs text-slate-400">{t.helper}</p>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || roomCode.length !== 6}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? t.checking : t.joinRoomBtn}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    setView("home");
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  {t.backBtn}
                </button>
              </form>
            )}

            {/* MOD */}
            {view === "mod" && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">{t.modTitle}</h2>
                  <p className="mt-2 text-sm text-slate-300">{t.modSubtitle}</p>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-white px-4 py-4 font-bold text-slate-900 shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? t.creating : `➕ ${t.createRoomBtn}`}
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-semibold tracking-[0.2em] text-slate-400">
                    {t.or}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleRejoinAsMod} className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={t.rejoinPlaceholder}
                      value={roomCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      maxLength={6}
                      required
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-center text-2xl font-bold uppercase tracking-[0.35em] text-white outline-none transition placeholder:text-slate-500 focus:border-white focus:ring-4 focus:ring-white/10 disabled:opacity-60"
                    />
                    <p className="text-center text-xs text-slate-400">{t.helper}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || roomCode.length !== 6}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? t.checking : t.rejoinBtn}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    setView("home");
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                  {t.backBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}