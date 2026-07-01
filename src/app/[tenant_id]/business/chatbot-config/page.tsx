import type { Metadata } from "next";
import { AlertCircle, Bot, Sparkles, SlidersHorizontal, MessageSquareText, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = { title: "Cấu hình AI" };

export default function ChatbotConfigPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cấu hình Chatbot & AI</h1>
        <p className="mt-1 text-muted-foreground">
          Lựa chọn mô hình ngôn ngữ lớn (LLM) và thiết lập kịch bản (Prompt) cho Chatbot của bạn.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p><strong>Lưu ý:</strong> Đây chỉ là Demo, tính năng chưa được phát triển. Dữ liệu bên dưới là giả lập.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: LLM Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Mô hình AI (LLM)
              </CardTitle>
              <CardDescription>
                Lựa chọn AI Model và tinh chỉnh độ sáng tạo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="model">Mô hình sử dụng</Label>
                <select 
                  id="model" 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="gpt-4o"
                >
                  <option value="gpt-4o">OpenAI GPT-4o (Khuyên dùng)</option>
                  <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  <option value="claude-3-sonnet">Anthropic Claude 3.5 Sonnet</option>
                </select>
                <p className="text-xs text-muted-foreground">Các Model có mức giá (Cost) và tốc độ (Latency) khác nhau.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Độ sáng tạo (Temperature)</Label>
                  <span className="text-xs font-mono">0.2</span>
                </div>
                <input 
                  type="range" 
                  id="temperature" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  defaultValue="0.2"
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Mức thấp (0-0.3) giúp AI trả lời chính xác theo tài liệu. Mức cao (0.7-1) giúp AI sáng tạo hơn nhưng dễ ảo giác (Hallucination).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                RAG & Tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topK">Số lượng tài liệu trích xuất (Top K)</Label>
                <Input id="topK" type="number" defaultValue={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="similarity">Độ tương đồng tối thiểu (Score)</Label>
                <Input id="similarity" type="number" step="0.05" defaultValue={0.75} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Prompt Engineering */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquareText className="h-5 w-5 text-primary" />
                Quản lý Prompts
              </CardTitle>
              <CardDescription>
                Thiết lập kịch bản giao tiếp cốt lõi cho Chatbot của cửa hàng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex-1">
              
              <div className="space-y-3">
                <Label htmlFor="systemPrompt" className="text-base font-semibold">System Prompt (Chỉ dẫn hệ thống)</Label>
                <p className="text-sm text-muted-foreground">
                  Đây là "não bộ" của Chatbot. Hãy miêu tả vai trò, tone giọng và quy tắc cấm.
                </p>
                <Textarea 
                  id="systemPrompt" 
                  className="min-h-[150px] font-mono text-sm leading-relaxed" 
                  defaultValue={`Bạn là nhân viên tư vấn bán hàng tận tâm của cửa hàng Eco Fashion.
Giọng điệu: Thân thiện, lịch sự, luôn dạ thưa.
Quy tắc:
1. LUÔN trả lời dựa trên thông tin sản phẩm và chính sách (Context) được cung cấp.
2. NẾU không tìm thấy thông tin, TUYỆT ĐỐI không tự bịa ra (No hallucination), hãy xin lỗi khách và yêu cầu liên hệ hotline.
3. Luôn gợi ý khách hàng chốt đơn sau khi cung cấp thông tin.`}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="initialPrompt" className="text-base font-semibold">Câu chào mở đầu (Initial Message)</Label>
                <Textarea 
                  id="initialPrompt" 
                  className="min-h-[80px]" 
                  defaultValue="Dạ chào bạn! Mình là trợ lý AI của Eco Fashion. Bạn đang tìm kiếm sản phẩm nào hay cần mình tư vấn size ạ?"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="fallbackPrompt" className="text-base font-semibold">Tin nhắn dự phòng (Fallback Message)</Label>
                <p className="text-sm text-muted-foreground">
                  Tin nhắn được gửi khi AI không biết câu trả lời hoặc hệ thống gặp lỗi.
                </p>
                <Textarea 
                  id="fallbackPrompt" 
                  className="min-h-[80px]" 
                  defaultValue="Dạ rất xin lỗi bạn, hiện tại mình chưa có thông tin chính xác cho câu hỏi này. Bạn vui lòng liên hệ trực tiếp hotline 0901234567 để nhân viên hỗ trợ ngay nhé!"
                />
              </div>

            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-4 justify-end">
              <Button disabled className="min-w-32 gap-2 shadow-sm">
                <Save className="h-4 w-4" /> Lưu cấu hình
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
