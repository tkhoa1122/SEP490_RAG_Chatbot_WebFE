"use client";

import { useState, useEffect } from "react";
import { Sparkles, SlidersHorizontal, MessageSquareText, Save, Loader2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { businessAPI } from "@/infrastructure/api/businessAPI";
import type { BusinessConfig, UpdateBusinessConfigCommand } from "@/infrastructure/dto/BusinessDTO";

export default function ChatbotConfigPage() {
  const [config, setConfig] = useState<BusinessConfig>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await businessAPI.getConfig();
      setConfig(res.data || {});
    } catch (error: any) {
      toast.error("Không thể tải cấu hình Chatbot", { description: error.response?.data?.message || error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (config.maxOutPutToken && (config.maxOutPutToken < 1 || config.maxOutPutToken > 8192)) {
      toast.error("Độ dài câu trả lời (Max Tokens) phải từ 1 đến 8192");
      return;
    }
    if (config.topKDocument && (config.topKDocument < 1 || config.topKDocument > 20)) {
      toast.error("Số lượng tài liệu (Top K) phải từ 1 đến 20");
      return;
    }
    if (config.rerankingScore !== undefined && config.rerankingScore !== null) {
      if (config.rerankingScore < 0 || config.rerankingScore > 1) {
        toast.error("Độ tương đồng (Reranking Score) phải từ 0 đến 1");
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: UpdateBusinessConfigCommand = {
        modelTemperature: config.modelTemperature,
        topKDocument: config.topKDocument,
        rerankingScore: config.rerankingScore,
        systemPrompt: config.systemPrompt,
        fallBackMessage: config.fallBackMessage,
        maxOutPutToken: config.maxOutPutToken,
      };
      await businessAPI.updateConfig(payload);
      toast.success("Đã lưu cấu hình Chatbot thành công!");
      fetchConfig();
    } catch (error: any) {
      toast.error("Lỗi khi lưu cấu hình", { description: error.response?.data?.message || error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục tất cả cấu hình về mặc định không?")) return;
    setIsResetting(true);
    try {
      await businessAPI.resetConfigDefault();
      toast.success("Đã khôi phục cấu hình mặc định!");
      fetchConfig();
    } catch (error: any) {
      toast.error("Lỗi khi khôi phục cấu hình", { description: error.response?.data?.message || error.message });
    } finally {
      setIsResetting(false);
    }
  };

  const handleChange = (key: keyof BusinessConfig, value: string | number | null) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Đang tải cấu hình AI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cấu hình Chatbot & AI</h1>
          <p className="mt-1 text-muted-foreground">
            Lựa chọn độ sáng tạo (Temperature) và thiết lập kịch bản (Prompt) cho Chatbot của bạn.
          </p>
        </div>
        <Button variant="outline" onClick={handleReset} disabled={isResetting || isSaving} className="shrink-0 gap-2">
          {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          Khôi phục mặc định
        </Button>
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
                Tinh chỉnh độ sáng tạo và độ dài câu trả lời.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mô hình đã bị ẩn vì API không hỗ trợ */}

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Độ sáng tạo (Temperature)</Label>
                  <span className="text-xs font-mono">{config.modelTemperature ?? 0.2}</span>
                </div>
                <input 
                  type="range" 
                  id="temperature" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={config.modelTemperature ?? 0.2}
                  onChange={(e) => handleChange("modelTemperature", parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Mức thấp (0-0.3) giúp AI trả lời chính xác. Mức cao (0.7-1) dễ sinh ra ảo giác.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Độ dài câu trả lời tối đa (Max Tokens)</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={() => handleChange("maxOutPutToken", Math.max(1, (config.maxOutPutToken ?? 1000) - 100))}
                  >
                    -
                  </Button>
                  <Input 
                    id="maxTokens" 
                    type="text" 
                    className="text-center font-mono h-9"
                    value={config.maxOutPutToken ?? 1000} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/\D/g, ""));
                      handleChange("maxOutPutToken", isNaN(val) ? 1000 : val);
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={() => handleChange("maxOutPutToken", Math.min(8192, (config.maxOutPutToken ?? 1000) + 100))}
                  >
                    +
                  </Button>
                </div>
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
                <Label htmlFor="topK">Số lượng tài liệu (Top K)</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={() => handleChange("topKDocument", Math.max(1, (config.topKDocument ?? 4) - 1))}
                  >
                    -
                  </Button>
                  <Input 
                    id="topK" 
                    type="text" 
                    className="text-center font-mono h-9"
                    value={config.topKDocument ?? 4} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/\D/g, ""));
                      handleChange("topKDocument", isNaN(val) ? 4 : val);
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={() => handleChange("topKDocument", Math.min(20, (config.topKDocument ?? 4) + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="similarity">Độ tương đồng (Reranking Score)</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={() => {
                      const cur = config.rerankingScore ?? 0.75;
                      handleChange("rerankingScore", Math.max(0, parseFloat((cur - 0.05).toFixed(2))));
                    }}
                  >
                    -
                  </Button>
                  <Input 
                    id="similarity" 
                    type="text" 
                    className="text-center font-mono h-9"
                    value={config.rerankingScore ?? 0.75} 
                    onChange={(e) => {
                      // Thay dấu phẩy thành dấu chấm để parse float đúng chuẩn
                      let strVal = e.target.value.replace(/,/g, ".");
                      // Giữ lại số và 1 dấu chấm
                      strVal = strVal.replace(/[^0-9.]/g, "");
                      
                      if (strVal === "" || strVal === ".") {
                        handleChange("rerankingScore", 0);
                        return;
                      }
                      
                      let val = parseFloat(strVal);
                      if (!isNaN(val)) {
                         handleChange("rerankingScore", val);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={() => {
                      const cur = config.rerankingScore ?? 0.75;
                      handleChange("rerankingScore", Math.min(1, parseFloat((cur + 0.05).toFixed(2))));
                    }}
                  >
                    +
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Giá trị từ 0.0 đến 1.0 (Có thể nhập số thập phân bằng dấu phẩy)
                </p>
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
                  value={config.systemPrompt ?? ""}
                  onChange={(e) => handleChange("systemPrompt", e.target.value)}
                  placeholder="Nhập System Prompt của bạn..."
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
                  value={config.fallBackMessage ?? ""}
                  onChange={(e) => handleChange("fallBackMessage", e.target.value)}
                  placeholder="Nhập tin nhắn dự phòng..."
                />
              </div>

            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-4 flex justify-end gap-3">
              <Button onClick={handleSave} disabled={isSaving || isResetting} className="min-w-32 gap-2 shadow-sm">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu cấu hình
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
