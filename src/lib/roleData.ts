// src/lib/roleData.ts

export type RoleInfo = {
  name: string;
  team: "good" | "evil";
  ability: { th: string; en: string };
  tip: { th: string; en: string };
};

export const ROLE_DETAILS: Record<string, RoleInfo> = {
  "Merlin": {
    name: "Merlin", team: "good",
    ability: { th: "รู้ว่าใครเป็นคนร้าย (ยกเว้น Mordred)", en: "Knows who the evil players are (except Mordred)." },
    tip: { th: "อย่าให้ Assassin รู้ว่าคุณคือ Merlin!", en: "Hide your identity so the Assassin doesn't kill you at the end!" },
  },
  "Percival": {
    name: "Percival", team: "good",
    ability: { th: "รู้ว่าใครคือ Merlin (แต่จะเห็น Morgana ด้วย)", en: "Knows who Merlin is (but also sees Morgana)." },
    tip: { th: "หา Merlin ตัวจริงให้เจอ และทำตัวเป็นโล่กำบังให้เขา", en: "Find the real Merlin and act as a shield to protect them." },
  },
  "Loyal Servant of Arthur": {
    name: "Loyal Servant of Arthur", team: "good",
    ability: { th: "ไม่มีพลังพิเศษ (เป็นคนดีธรรมดา)", en: "No special abilities." },
    tip: { th: "สังเกตการโหวตเพื่อหาว่าใครเป็นพวกเดียวกัน", en: "Observe the voting patterns to find your allies." },
  },
  "Assassin": {
    name: "Assassin", team: "evil",
    ability: { th: "หากฝ่ายดีทำภารกิจสำเร็จ 3 ครั้ง คุณมีสิทธิ์ทายว่าใครคือ Merlin", en: "If the Good team wins 3 quests, you can assassinate Merlin." },
    tip: { th: "สังเกตคนที่ดูเหมือนจะรู้ข้อมูลเยอะผิดปกติ", en: "Watch for players who seem to know too much." },
  },
  "Morgana": {
    name: "Morgana", team: "evil",
    ability: { th: "หลอก Percival ให้เห็นว่าคุณคือ Merlin", en: "Appears as Merlin to Percival." },
    tip: { th: "พยายามทำตัวให้ดูมีความรู้ เพื่อให้ Percival หลงเชื่อ", en: "Act like you have information so Percival trusts you." },
  },
  "Mordred": {
    name: "Mordred", team: "evil",
    ability: { th: "ซ่อนตัวจาก Merlin", en: "Unknown to Merlin." },
    tip: { th: "คุณคือสายลับที่เนียนที่สุด! เข้าไปตีสนิทกับฝ่ายดีเลย", en: "You are the ultimate spy! Blend in with the Good team." },
  },
  "Oberon": {
    name: "Oberon", team: "evil",
    ability: { th: "ไม่รู้จักเพื่อนฝ่ายร้าย และเพื่อนก็ไม่รู้จักคุณ", en: "Unknown to Evil, and does not know other Evil players." },
    tip: { th: "ป่วนเกมให้ได้มากที่สุด แม้แต่เพื่อนก็จะงงกับคุณ!", en: "Cause chaos! Even your evil teammates won't know you." },
  },
  "Minion of Mordred": {
    name: "Minion of Mordred", team: "evil",
    ability: { th: "ไม่มีพลังพิเศษ แต่รู้จักเพื่อนฝ่ายร้ายทุกคน", en: "No special abilities, but knows other Evil players." },
    tip: { th: "กลมกลืนกับคนดี และช่วยเพื่อนฝ่ายร้ายโหวตล่มภารกิจ", en: "Blend in with the Good team and fail quests when possible." },
  },
};