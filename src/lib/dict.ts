// src/lib/dict.ts

export const DICT = {
  th: {
    modLabel: "👑 คุณคือ Moderator",
    reconnectHint: "หากหลุดออกจากห้อง พิมพ์ชื่อเดิมเพื่อกลับเข้าสู่เกม",
    namePlaceholder: "ชื่อของคุณ",
    joinBtn: "เข้าสู่ห้อง",
    playerList: "ผู้เล่นในห้อง",
    waitingPlayer: "กำลังรอผู้เล่น...",
    addRole: "➕ เพิ่มตัวละคร (จิ้มเพื่อเลือก)...",
    startGameBtn: "เริ่มการยืนยันบทบาท",
    confirmRoleTitle: "ยืนยันบทบาทของคุณ",
    checkCard: "ดูการ์ดจริงในมือ แล้วจิ้มเลือกตัวละครที่คุณได้",
    wrongRoleBtn: "กดผิด? เลือกใหม่",
    waitingMod: "รอ Moderator ตั้งค่าเกม...",
    systemCheck: "ระบบตรวจสอบ Role",
    roleConflict: "พบปัญหาขัดแย้ง:",
    dataPerfect: "ข้อมูลถูกต้อง! เข้าสู่ช่วงกลางคืน",
    waitingCorrect: "รอข้อมูลถูกต้อง...",
    nightScriptTitle: "🌙 สคริปต์ช่วงกลางคืน",
    startDayBtn: "☀️ เริ่มช่วงเช้า (Day Phase)",
    dayPhaseTitle: "☀️ ช่วงเช้า (Day Phase)",
    allPlayersData: "📋 ข้อมูลผู้เล่นทั้งหมด",
    discussHintMod: "ให้ผู้เล่นปรึกษากันและโหวตจัดทีมบนโต๊ะได้เลย!",
    resetBtn: "🔄 จบเกม / ล้างไพ่เริ่มรอบใหม่",
    yourRoleIs: "บทบาทของคุณคือ",
    ability: "✨ ความสามารถ:",
    tip: "💡 ทริคการเล่น:",
    discussTime: "ถึงเวลาพูดคุย!",
    discussHintPlayer: "วางมือถือลง ปรึกษาและจับผิดเพื่อนบนโต๊ะได้เลย",
    waitingReset: "รอ Moderator กดจบเกม...",
  },
  en: {
    modLabel: "👑 You are the Moderator",
    reconnectHint: "If disconnected, enter your exact name to rejoin.",
    namePlaceholder: "Your Name",
    joinBtn: "Join Room",
    playerList: "Players in Room",
    waitingPlayer: "Waiting for players...",
    addRole: "➕ Add Role (Tap to select)...",
    startGameBtn: "Start Role Confirmation",
    confirmRoleTitle: "Confirm Your Role",
    checkCard: "Check your physical card, then select your role.",
    wrongRoleBtn: "Mistake? Reselect",
    waitingMod: "Waiting for Moderator to set up...",
    systemCheck: "Role Validation System",
    roleConflict: "Conflict Detected:",
    dataPerfect: "All Good! Go to Night Phase",
    waitingCorrect: "Waiting for correct data...",
    nightScriptTitle: "🌙 Night Phase Script",
    startDayBtn: "☀️ Start Day Phase",
    dayPhaseTitle: "☀️ Day Phase",
    allPlayersData: "📋 All Players Data",
    discussHintMod: "Let players discuss and vote for the team physically!",
    resetBtn: "🔄 End Game / Reset for New Round",
    yourRoleIs: "Your Role is",
    ability: "✨ Ability:",
    tip: "💡 Playing Tip:",
    discussTime: "Discussion Time!",
    discussHintPlayer: "Put your phone down and discuss with your friends.",
    waitingReset: "Waiting for Moderator to end game...",
  }
};

// ฟังก์ชันสร้างสคริปต์กลางคืนแบบ 2 ภาษา
export const getNightScript = (lang: "th" | "en", evilWakingUp: string[], evilForMerlin: string[], percivalTargets: string[], hasMerlin: boolean, hasPercival: boolean) => {
  const isTH = lang === "th";
  let script = [];
  
  script.push(isTH ? "ทุกคนหลับตาและยื่นมือมาข้างหน้ากำหมัดไว้" : "Everyone, close your eyes and extend your hand in a fist.");
  
  if (evilWakingUp.length > 0) {
    script.push(isTH 
      ? `"${evilWakingUp.join(" และ ")} ลืมตาและมองหน้ากันและกัน..." \n(รอสักพัก)\n"${evilWakingUp.join(" และ ")} หลับตาลง"`
      : `"${evilWakingUp.join(" and ")} open your eyes and look around..." \n(Wait a moment)\n"${evilWakingUp.join(" and ")} close your eyes."`
    );
  }
  if (hasMerlin) {
    script.push(isTH 
      ? `"${evilForMerlin.join(" และ ")} ชูนิ้วโป้งขึ้นมา"\n"เมอร์ลิน ลืมตาขึ้นเพื่อดูว่าใครคือคนร้าย..." \n(รอสักพัก)\n"${evilForMerlin.join(" และ ")} เอานิ้วโป้งลง"\n"เมอร์ลิน หลับตาลง"`
      : `"${evilForMerlin.join(" and ")} extend your thumb."\n"Merlin, open your eyes to see the agents of evil..." \n(Wait a moment)\n"${evilForMerlin.join(" and ")} put your thumbs down."\n"Merlin, close your eyes."`
    );
  }
  if (hasPercival) {
    script.push(isTH 
      ? `"${percivalTargets.join(" และ ")} ชูนิ้วโป้งขึ้นมา"\n"เพอร์ซิวัล ลืมตาขึ้น..." \n(รอสักพัก)\n"${percivalTargets.join(" และ ")} เอานิ้วโป้งลง"\n"เพอร์ซิวัล หลับตาลง"`
      : `"${percivalTargets.join(" and ")} extend your thumb."\n"Percival, open your eyes to see Merlin and Morgana..." \n(Wait a moment)\n"${percivalTargets.join(" and ")} put your thumbs down."\n"Percival, close your eyes."`
    );
  }
  script.push(isTH ? "ทุกคน ลืมตาขึ้นมา... เริ่มปรึกษากันได้!" : "Everyone, open your eyes... Discussion begins!");
  
  return script;
};