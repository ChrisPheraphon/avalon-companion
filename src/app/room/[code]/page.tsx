"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabase";
import { useSearchParams } from "next/navigation";
import { ROLE_DETAILS } from "../../../lib/roleData";
import { DICT, getNightScript } from "../../../lib/dict";

const GOOD_ROLES = ["Merlin", "Percival", "Loyal Servant of Arthur"];
const EVIL_ROLES = ["Assassin", "Morgana", "Mordred", "Oberon", "Minion of Mordred"];
const ALL_ROLES = [...GOOD_ROLES, ...EVIL_ROLES];

export default function RoomLobby({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code.toUpperCase();

  const searchParams = useSearchParams();
  const isMod = searchParams.get("mod") === "true";

  const [playerName, setPlayerName] = useState("");
  const [isJoined, setIsJoined] = useState(isMod);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);

  const [gameStatus, setGameStatus] = useState("lobby");
  const [activeRoles, setActiveRoles] = useState<string[]>([]);
  const [myRole, setMyRole] = useState<string | null>(null);

  const [lang, setLang] = useState<"th" | "en">("th");
  const t = DICT[lang];

  useEffect(() => {
    const savedLang =
      typeof window !== "undefined" ? localStorage.getItem("avalon_lang") : null;
    if (savedLang === "en" || savedLang === "th") setLang(savedLang);

    const savedPlayerId =
      typeof window !== "undefined"
        ? localStorage.getItem(`avalon_player_${roomCode}`)
        : null;

    if (savedPlayerId && !isMod) {
      setMyPlayerId(savedPlayerId);
      setIsJoined(true);
    }

    const fetchRoomData = async () => {
      const { data: roomData } = await supabase
        .from("rooms")
        .select("game_status, active_roles")
        .eq("code", roomCode)
        .single();

      if (roomData) {
        setGameStatus(roomData.game_status || "lobby");
        setActiveRoles(roomData.active_roles || []);
      }
    };

    const fetchPlayers = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("room_code", roomCode)
        .order("created_at", { ascending: true });

      if (data) {
        setPlayers(data);
        if (savedPlayerId) {
          const me = data.find((p) => p.id === savedPlayerId);
          if (me) setMyRole(me.role || null);
        }
      }
    };

    fetchRoomData();
    fetchPlayers();

    const playerSub = supabase
      .channel(`players-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_code=eq.${roomCode}`,
        },
        () => fetchPlayers()
      )
      .subscribe();

    const roomSub = supabase
      .channel(`rooms-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          setGameStatus(payload.new.game_status);
          setActiveRoles(payload.new.active_roles);
          if (payload.new.game_status === "lobby") setMyRole(null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playerSub);
      supabase.removeChannel(roomSub);
    };
  }, [roomCode, isMod]);

  const changeLang = (newLang: "th" | "en") => {
    setLang(newLang);
    localStorage.setItem("avalon_lang", newLang);
  };

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim();
    if (!cleanName) return;

    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id, role")
      .eq("room_code", roomCode)
      .eq("name", cleanName)
      .maybeSingle();

    let playerIdToSave = null;

    if (existingPlayer) {
      playerIdToSave = existingPlayer.id;
      if (existingPlayer.role) setMyRole(existingPlayer.role);
    } else {
      const { data, error } = await supabase
        .from("players")
        .insert([{ room_code: roomCode, name: cleanName }])
        .select("id")
        .single();

      if (error) {
        alert("Error: " + error.message);
        return;
      }
      playerIdToSave = data.id;
    }

    setMyPlayerId(playerIdToSave);
    localStorage.setItem(`avalon_player_${roomCode}`, playerIdToSave);
    setIsJoined(true);
  };

  const addRole = (role: string) => setActiveRoles((prev) => [...prev, role]);
  const removeRole = (indexToRemove: number) =>
    setActiveRoles((prev) => prev.filter((_, i) => i !== indexToRemove));

  const handleStartGame = async () => {
    if (activeRoles.length !== players.length) {
      alert(
        lang === "th"
          ? "กรุณาเลือกตัวละครให้เท่ากับจำนวนคน"
          : "Please select roles equal to the number of players"
      );
      return;
    }

    const { error } = await supabase
      .from("rooms")
      .update({ game_status: "role_selection", active_roles: activeRoles })
      .eq("code", roomCode);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setGameStatus("role_selection");
    }
  };

  const handleStartNightPhase = async () =>
    await supabase
      .from("rooms")
      .update({ game_status: "night_phase" })
      .eq("code", roomCode);

  const handleStartDayPhase = async () =>
    await supabase
      .from("rooms")
      .update({ game_status: "day_phase" })
      .eq("code", roomCode);

  const handleSelectRole = async (role: string) => {
    if (!myPlayerId) return;
    const { error } = await supabase
      .from("players")
      .update({ role: role || null })
      .eq("id", myPlayerId);

    if (!error) setMyRole(role || null);
  };

  const handleResetGame = async () => {
    const confirmMsg =
      lang === "th"
        ? "แน่ใจหรือไม่ที่จะจบเกมและล้างข้อมูลบทบาททุกคนเพื่อเริ่มรอบใหม่?"
        : "Are you sure you want to end the game and reset all roles?";

    if (!confirm(confirmMsg)) return;

    const playerIds = players.map((p) => p.id);
    if (playerIds.length > 0) {
      await supabase.from("players").update({ role: null }).in("id", playerIds);
    }

    setMyRole(null);
    await supabase
      .from("rooms")
      .update({ game_status: "lobby", active_roles: [] })
      .eq("code", roomCode);
  };

  const getRoleValidation = () => {
    const expectedCounts: Record<string, number> = {};
    activeRoles.forEach((r) => (expectedCounts[r] = (expectedCounts[r] || 0) + 1));

    const submittedCounts: Record<string, number> = {};
    const submittedPlayers = players.filter((p) => p.role);
    submittedPlayers.forEach(
      (p) => (submittedCounts[p.role] = (submittedCounts[p.role] || 0) + 1)
    );

    const errors: string[] = [];
    Object.keys(submittedCounts).forEach((role) => {
      const exp = expectedCounts[role] || 0;
      const sub = submittedCounts[role];
      if (sub > exp) {
        errors.push(
          lang === "th"
            ? `⚠️ มีคนกด ${role} เกินมา ${sub - exp} คน`
            : `⚠️ Too many ${role} selected (+${sub - exp})`
        );
      } else if (exp === 0) {
        errors.push(
          lang === "th"
            ? `❌ มีคนกด ${role} ทั้งที่ไม่มีในรอบนี้`
            : `❌ ${role} selected but not in game`
        );
      }
    });

    return {
      submittedPlayers,
      errors,
      isPerfect:
        submittedPlayers.length === players.length &&
        players.length > 0 &&
        errors.length === 0,
    };
  };

  const validation = getRoleValidation();
  const myRoleDetails = myRole ? ROLE_DETAILS[myRole] : null;

  const evilWakingUp = activeRoles.filter(
    (r) => EVIL_ROLES.includes(r) && r !== "Oberon"
  );
  const evilForMerlin = activeRoles.filter(
    (r) => EVIL_ROLES.includes(r) && r !== "Mordred"
  );
  const percivalTargets = activeRoles.filter(
    (r) => r === "Merlin" || r === "Morgana"
  );

  const nightScriptLines = getNightScript(
    lang,
    evilWakingUp,
    evilForMerlin,
    percivalTargets,
    activeRoles.includes("Merlin"),
    activeRoles.includes("Percival")
  );

  const statusTone =
    gameStatus === "lobby"
      ? "bg-slate-700/60 text-slate-200 border-white/10"
      : gameStatus === "role_selection"
      ? "bg-sky-500/15 text-sky-200 border-sky-400/20"
      : gameStatus === "night_phase"
      ? "bg-violet-500/15 text-violet-200 border-violet-400/20"
      : "bg-amber-500/15 text-amber-200 border-amber-400/20";

  const statusLabel =
    gameStatus === "lobby"
      ? "Lobby"
      : gameStatus === "role_selection"
      ? "Role Selection"
      : gameStatus === "night_phase"
      ? "Night Phase"
      : "Day Phase";

  const SectionCard = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 shadow-xl backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );

  const RoleInfoCard = () => {
    if (!myRoleDetails) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
          ...
        </div>
      );
    }

    const isGood = myRoleDetails.team === "good";

    return (
      <div
        className={`rounded-3xl border p-6 shadow-xl ${
          isGood
            ? "border-blue-400/20 bg-blue-500/10"
            : "border-red-400/20 bg-red-500/10"
        }`}
      >
        <p className="mb-2 text-sm font-semibold text-slate-300">{t.yourRoleIs}</p>
        <h3
          className={`text-3xl font-extrabold ${
            isGood ? "text-blue-300" : "text-red-300"
          }`}
        >
          {myRoleDetails.name}
        </h3>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <strong className="mb-2 block text-sm text-white">{t.ability}</strong>
          {/* 🌟 บังคับแก้ Type ข้อมูลความสามารถตรงนี้ 🌟 */}
          <p className="text-sm leading-6 text-slate-300">
            {(myRoleDetails.ability as any)[lang]}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
          <strong className="mb-2 block text-sm text-yellow-300">{t.tip}</strong>
          {/* 🌟 บังคับแก้ Type ข้อมูลทริคตรงนี้ 🌟 */}
          <p className="text-sm leading-6 text-slate-200">
            {(myRoleDetails.tip as any)[lang]}
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.15),_transparent_26%),linear-gradient(to_bottom,_#020617,_#0f172a)]" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 md:px-6 md:py-10">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-end">
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            <button
              onClick={() => changeLang("th")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                lang === "th"
                  ? "bg-white text-slate-900 shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🇹🇭 ไทย
            </button>
            <button
              onClick={() => changeLang("en")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                lang === "en"
                  ? "bg-white text-slate-900 shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>

        {/* Header */}
        <SectionCard className="mb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200">
                Avalon Room
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Room{" "}
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text tracking-[0.18em] text-transparent">
                  {roomCode}
                </span>
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                {isMod ? t.modLabel : t.playerList}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isMod && (
                <span className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200">
                  👑 MODERATOR
                </span>
              )}
              <span
                className={`rounded-full border px-4 py-2 text-sm font-bold ${statusTone}`}
              >
                {statusLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
                👥 {players.length}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Join screen */}
        {!isJoined && !isMod ? (
          <div className="mx-auto w-full max-w-xl">
            <SectionCard>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{t.joinBtn}</h2>
                <p className="mt-2 text-sm text-slate-300">{t.reconnectHint}</p>
              </div>

              <form onSubmit={handleJoinLobby} className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-center text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
                  maxLength={12}
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.01]"
                >
                  {t.joinBtn}
                </button>
              </form>
            </SectionCard>
          </div>
        ) : gameStatus === "day_phase" ? (
          <div className="grid gap-6">
            <SectionCard>
              <div className="text-center">
                <div className="mb-3 inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-200">
                  ☀️ DAY PHASE
                </div>
                <h2 className="text-3xl font-extrabold text-amber-300">
                  {t.dayPhaseTitle}
                </h2>
              </div>
            </SectionCard>

            {isMod ? (
              <SectionCard>
                <h3 className="mb-4 text-xl font-bold">{t.allPlayersData}</h3>

                <div className="space-y-3">
                  {players.map((p) => {
                    const isGood = GOOD_ROLES.includes(p.role);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <span className="font-semibold text-white">{p.name}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isGood
                              ? "border border-blue-400/20 bg-blue-500/10 text-blue-200"
                              : "border border-red-400/20 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {p.role || "?"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-6 text-center text-sm text-slate-300">
                  {t.discussHintMod}
                </p>

                <button
                  onClick={handleResetGame}
                  className="mt-6 w-full rounded-2xl bg-red-600 px-4 py-4 font-bold text-white shadow-lg transition hover:bg-red-700"
                >
                  🔄 {t.resetBtn}
                </button>
              </SectionCard>
            ) : (
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <RoleInfoCard />

                <SectionCard className="flex flex-col justify-center text-center">
                  <p className="text-xl font-bold text-white">{t.discussTime}</p>
                  <p className="mt-2 text-sm text-slate-300">{t.discussHintPlayer}</p>
                  <p className="mt-6 text-xs text-slate-400 animate-pulse">
                    {t.waitingReset}
                  </p>
                </SectionCard>
              </div>
            )}
          </div>
        ) : gameStatus === "night_phase" ? (
          <div className="grid gap-6">
            <SectionCard>
              <div className="text-center">
                <div className="mb-3 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">
                  🌙 NIGHT PHASE
                </div>
                <h2 className="text-3xl font-extrabold text-violet-300">
                  {t.nightScriptTitle}
                </h2>
              </div>
            </SectionCard>

            {isMod ? (
              <SectionCard className="border-violet-400/20 bg-violet-500/10">
                <ol className="list-decimal space-y-4 pl-5 text-sm leading-7 text-slate-100">
                  {nightScriptLines.map((line, idx) => (
                    <li
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3"
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(
                              /"(.*?)"/g,
                              '<strong class="text-white">"$1"</strong>'
                            )
                            .replace(/\n/g, "<br/>"),
                        }}
                      />
                    </li>
                  ))}
                </ol>

                <button
                  onClick={handleStartDayPhase}
                  className="mt-6 w-full rounded-2xl bg-orange-500 px-4 py-4 font-bold text-white shadow-lg transition hover:bg-orange-600"
                >
                  {t.startDayBtn}
                </button>
              </SectionCard>
            ) : (
              <div className="mx-auto w-full max-w-2xl">
                <RoleInfoCard />
                <p className="mt-6 text-center text-sm text-slate-400 animate-pulse">
                  ...
                </p>
              </div>
            )}
          </div>
        ) : gameStatus === "role_selection" ? (
          <div className="grid gap-6">
            <SectionCard>
              <div className="text-center">
                <div className="mb-3 inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-200">
                  🃏 ROLE SELECTION
                </div>
                <h2 className="text-3xl font-extrabold text-sky-300">
                  {t.confirmRoleTitle}
                </h2>
              </div>
            </SectionCard>

            {isMod ? (
              <SectionCard>
                <h3 className="mb-4 text-xl font-bold">{t.systemCheck}</h3>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                  <ul className="space-y-2">
                    {players.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3"
                      >
                        <span className="font-semibold text-white">{p.name}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            p.role
                              ? "bg-blue-500/10 text-blue-200 border border-blue-400/20"
                              : "bg-white/5 text-slate-400 border border-white/10"
                          }`}
                        >
                          {p.role || "..."}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {validation.errors.length > 0 && (
                  <div className="mt-5 rounded-3xl border border-red-400/20 bg-red-500/10 p-4">
                    <p className="mb-2 font-bold text-red-200">{t.roleConflict}</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-red-100">
                      {validation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleStartNightPhase}
                  disabled={!validation.isPerfect}
                  className={`mt-6 w-full rounded-2xl px-4 py-4 text-lg font-bold text-white transition ${
                    validation.isPerfect
                      ? "bg-green-600 shadow-lg hover:bg-green-700"
                      : "cursor-not-allowed bg-slate-600"
                  }`}
                >
                  {validation.isPerfect ? t.dataPerfect : t.waitingCorrect}
                </button>
              </SectionCard>
            ) : (
              <SectionCard>
                {myRole ? (
                  <div className="py-8 text-center">
                    <h3 className="text-2xl font-bold text-green-300">
                      {t.yourRoleIs}: {myRole}
                    </h3>
                    <button
                      onClick={() => handleSelectRole("")}
                      className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-white/10"
                    >
                      {t.wrongRoleBtn}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mb-5 text-center text-sm font-medium text-slate-300">
                      {t.checkCard}
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {ALL_ROLES.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleSelectRole(role)}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-500/10 hover:border-blue-400/20"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <SectionCard>
              <h2 className="mb-4 text-xl font-bold">
                {t.playerList} ({players.length})
              </h2>

              <ul className="min-h-[160px] rounded-3xl border border-white/10 bg-white/5 p-3">
                {players.length === 0 ? (
                  <li className="py-8 text-center text-slate-400">
                    {t.waitingPlayer}
                  </li>
                ) : (
                  players.map((p, i) => (
                    <li
                      key={p.id}
                      className="border-b border-white/10 px-3 py-3 text-slate-100 last:border-0"
                    >
                      <span className="font-semibold text-blue-200">{i + 1}.</span>{" "}
                      {p.name}
                    </li>
                  ))
                )}
              </ul>
            </SectionCard>

            {isMod ? (
              <SectionCard>
                <h3 className="mb-3 text-xl font-bold">
                  Role Setup ({activeRoles.length}/{players.length})
                </h3>

                <div className="mb-4 min-h-[88px] rounded-3xl border border-white/10 bg-white/5 p-3">
                  <div className="flex flex-wrap gap-2">
                    {activeRoles.length === 0 ? (
                      <p className="text-sm text-slate-400">{t.addRole}</p>
                    ) : (
                      activeRoles.map((role, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-200"
                        >
                          {role}
                          <button
                            onClick={() => removeRole(idx)}
                            className="text-red-300 transition hover:text-red-200"
                          >
                            ✖
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <select
                  className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-blue-400"
                  onChange={(e) => {
                    if (e.target.value) addRole(e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="" className="text-slate-400">
                    {t.addRole}
                  </option>
                  <optgroup label={lang === "th" ? "ฝ่ายน้ำเงิน (คนดี)" : "Good"}>
                    {GOOD_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={lang === "th" ? "ฝ่ายแดง (คนร้าย)" : "Evil"}>
                    {EVIL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <button
                  onClick={handleStartGame}
                  className="w-full rounded-2xl bg-green-600 px-4 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-700"
                >
                  {t.startGameBtn}
                </button>
              </SectionCard>
            ) : (
              <SectionCard className="flex items-center justify-center text-center">
                <p className="animate-pulse text-slate-300">{t.waitingMod}</p>
              </SectionCard>
            )}
          </div>
        )}
      </div>
    </main>
  );
}