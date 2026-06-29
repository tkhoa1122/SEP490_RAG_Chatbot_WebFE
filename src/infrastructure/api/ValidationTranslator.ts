/**
 * Helper để dịch các thông báo lỗi Validation chung từ Backend (.NET / ASP.NET Core) sang tiếng Việt.
 */

export const ValidationDictionary: Record<string, string> = {
  "is required": "không được để trống",
  "is not a valid e-mail address": "không đúng định dạng email",
  "must be a valid URL": "phải là một đường dẫn URL hợp lệ",
  "The field": "Trường",
  "The": "Trường",
  "must be between": "phải nằm trong khoảng",
  "is invalid": "không hợp lệ",
  "already exists": "đã tồn tại",
  "not found": "không tìm thấy",
  "One or more validation errors occurred": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  "Validation failed": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
};

export function translateValidationError(errorMsg: string): string {
  let translated = errorMsg;
  
  // Dịch các cụm từ phổ biến
  for (const [en, vi] of Object.entries(ValidationDictionary)) {
    // Thay thế case-insensitive nếu cần, nhưng thường ta chỉ replace thẳng.
    translated = translated.replace(new RegExp(en, "gi"), vi);
  }

  // Làm sạch nếu "Trường BusinessName không được để trống"
  // Thay thế các tên biến chuẩn PascalCase thành có khoảng trắng (nếu cần), 
  // nhưng thường giữ nguyên tên trường để user tự hiểu cũng được.
  return translated;
}
