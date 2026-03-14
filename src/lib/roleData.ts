// src/lib/roleData.ts

export type RoleInfo = {
  name: string;
  team: "good" | "evil";
  ability: string;
  tip: string;
};

export const ROLE_DETAILS: Record<string, RoleInfo> = {
  "Merlin": {
    name: "Merlin",
    team: "good",
    ability: "รู้ว่าใครเป็นคนร้าย (ยกเว้น Mordred)",
    tip: "พยายามใช้ข้อมูลนี้เพื่อช่วยทีมโหวตให้ถูก แต่ต้องเนียนที่สุด อย่าให้ Assassin รู้ว่าคุณคือ Merlin ไม่งั้นตอนจบเกมจะโดนลอบสังหาร!",
  },
  "Percival": {
    name: "Percival",
    team: "good",
    ability: "รู้ว่าใครคือ Merlin (แต่จะเห็น Morgana เป็น Merlin ด้วย)",
    tip: "คุณต้องหาให้เจอว่าใครคือ Merlin ตัวจริง แล้วทำตัวเป็นโล่กำบังให้เขา เพื่อไม่ให้ Assassin รู้ตัว",
  },
  "Loyal Servant of Arthur": {
    name: "Loyal Servant of Arthur",
    team: "good",
    ability: "ไม่มีพลังพิเศษ (เป็นคนดีธรรมดา)",
    tip: "ใช้การสังเกตการโหวตและพฤติกรรมเพื่อหาว่าใครเป็นพวกเดียวกัน อย่าเชื่อใจใครง่ายๆ",
  },
  "Assassin": {
    name: "Assassin",
    team: "evil",
    ability: "หากฝ่ายดีทำภารกิจสำเร็จ 3 ครั้ง คุณมีสิทธิ์ทายว่าใครคือ Merlin ถ้าทายถูก ฝ่ายร้ายชนะทันที!",
    tip: "สังเกตคนที่ดูเหมือนจะรู้ข้อมูลเยอะผิดปกติ หรือคนที่พยายามชี้นำเกมเงียบๆ คนนั้นแหละคือเป้าหมายของคุณ",
  },
  "Morgana": {
    name: "Morgana",
    team: "evil",
    ability: "หลอก Percival ให้เห็นว่าคุณคือ Merlin",
    tip: "พยายามทำตัวให้ดูมีความรู้ ชี้นำทีมแบบเนียนๆ เพื่อให้ Percival หลงเชื่อและปกป้องคุณ",
  },
  "Mordred": {
    name: "Mordred",
    team: "evil",
    ability: "ซ่อนตัวจาก Merlin (Merlin จะเห็นคุณเป็นคนดี)",
    tip: "คุณคือสายลับที่เนียนที่สุดในเกม! ใช้ความได้เปรียบนี้เข้าไปตีสนิทกับฝ่ายดีเพื่อล่มภารกิจ",
  },
  "Oberon": {
    name: "Oberon",
    team: "evil",
    ability: "ไม่รู้จักเพื่อนฝ่ายร้าย และเพื่อนฝ่ายร้ายก็ไม่รู้จักคุณ",
    tip: "คุณต้องเล่นแบบฉายเดี่ยว ป่วนเกมให้ได้มากที่สุด แม้แต่เพื่อนฝ่ายร้ายก็จะงงกับคุณ!",
  },
  "Minion of Mordred": {
    name: "Minion of Mordred",
    team: "evil",
    ability: "ไม่มีพลังพิเศษ แต่รู้จักเพื่อนฝ่ายร้ายทุกคน (ยกเว้น Oberon)",
    tip: "พยายามทำตัวกลมกลืนกับคนดี และช่วยเพื่อนฝ่ายร้ายโหวตล่มภารกิจเมื่อมีโอกาส",
  },
};