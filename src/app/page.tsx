import { redirect } from "next/navigation";

export default function RootIndexPage() {
  // Tạm thời redirect thẳng về cửa hàng mặc định (eco-fashion)
  // Sau này bạn có thể thay file này bằng trang Landing Page giới thiệu nền tảng SaaS
  redirect("/eco-fashion");
}
