import { redirect } from "next/navigation";

// Root page — redirect theo role (middleware đã validate token)
// Đây chỉ là fallback, middleware xử lý hầu hết redirect
export default function RootPage() {
  redirect("/login");
}
