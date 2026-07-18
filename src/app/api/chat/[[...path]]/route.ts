import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, await params);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, await params);
}

async function handleProxy(req: NextRequest, params: { path?: string[] }) {
  try {
    const apiKey = process.env.CHATBOT_API_KEY;
    if (!apiKey) {
      console.error("[API Proxy] Missing CHATBOT_API_KEY in environment variables");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const pathString = params.path ? params.path.join("/") : "";
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://mahihi.com";
    
    // Khởi tạo URL backend
    const targetUrl = new URL(`/api/v1/chat/${pathString}`, backendUrl);
    
    // Sao chép query parameters từ request hiện tại
    const searchParams = req.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    console.log(`[API Proxy] Forwarding ${req.method} to ${targetUrl.toString()}`);

    // Chuẩn bị options cho fetch
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        // Forward các header an toàn
        "Accept": req.headers.get("Accept") || "application/json",
      },
    };

    // Chỉ đọc body nếu method không phải GET/HEAD
    if (req.method !== "GET" && req.method !== "HEAD") {
      const bodyText = await req.text();
      if (bodyText) {
        fetchOptions.body = bodyText;
      }
    }

    // Gọi lên backend thật
    const response = await fetch(targetUrl.toString(), fetchOptions);

    // Đọc kết quả từ backend
    const responseBody = await response.text();

    // Trả về cho frontend
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/json");

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error: any) {
    console.error("[API Proxy] Error forwarding request:", error);
    return NextResponse.json(
      { message: "Internal Proxy Error", detail: error.message },
      { status: 500 }
    );
  }
}
