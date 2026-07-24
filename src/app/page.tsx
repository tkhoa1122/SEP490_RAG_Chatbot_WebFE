import { redirect } from "next/navigation";

export default function RootIndexPage() {
  // Tạm thời redirect thẳng về trang Đăng nhập quản trị
  // Nền tảng này hiện tại chỉ dành cho Admin và Business Owner
  redirect("/login");
}
