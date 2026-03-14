import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css"; // ดึงไฟล์ CSS หลักมาใช้

export const metadata: Metadata = {
  title: "Avalon Companion Web",
  description: "Board game companion app for Avalon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        
        {/* --- ส่วน Navigator (Navbar) --- */}
        <nav className="bg-gray-900 text-white p-4 shadow-md w-full">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            {/* กดที่โลโก้แล้วจะกลับไปหน้า Home เสมอ */}
            <Link href="/" className="text-xl font-bold tracking-widest hover:text-gray-300 transition flex items-center gap-2">
              🗡️ AVALON 
            </Link>
            
            {/* พื้นที่สำหรับใส่เมนูอื่นๆ ในอนาคต (เช่น ชื่อผู้เล่น หรือ Room Code) */}
            <div className="text-sm text-gray-400">
              Companion App
            </div>
          </div>
        </nav>

        {/* --- ส่วนเนื้อหาหลัก (พวกหน้า page.tsx ต่างๆ จะมาโผล่ตรงนี้) --- */}
        <main className="flex-grow flex flex-col relative w-full">
          {children}
        </main>

      </body>
    </html>
  );
}