# 🧪 Hướng Dẫn Kiểm Thử (Testing Guide) - Smart Shopping Chatbot

Dự án **Smart Shopping Chatbot WebFE** là một hệ thống Frontend khá phức tạp (Next.js, kết nối RAG Chatbot, Quản lý sản phẩm, Thanh toán PayOS). Tùy thuộc vào độ bao phủ (Code Coverage) mà đội ngũ mong muốn, bạn có thể viết từ **vài chục đến hàng ngàn Test Cases**. 

Dưới đây là một bản tóm tắt chi tiết về chiến lược kiểm thử, số lượng test case tiềm năng, và hướng dẫn chi tiết cách cài đặt, sử dụng và hoạt động của chúng.

---

## 1. Có thể viết bao nhiêu Test Case cho dự án này?

Với quy mô hiện tại của hệ thống, số lượng Test Case tối ưu rơi vào khoảng **200 - 300 Test Cases**, được chia làm 3 cấp độ:

1. **Unit Tests (Kiểm thử mức Đơn vị - Khoảng 150-200 cases):** Kiểm thử độc lập từng hàm nhỏ, từng Component UI (Ví dụ: Hàm format tiền tệ, Component Nút bấm, Bảng hiển thị có render đúng data không).
2. **Integration Tests (Kiểm thử Tích hợp - Khoảng 50-70 cases):** Kiểm thử việc kết hợp nhiều Component và API (Ví dụ: Nhấn nút Import -> Modal hiện lên -> Bấm submit -> Gọi API mock và hiện thông báo Success/Error).
3. **End-to-End (E2E) Tests (Kiểm thử Toàn trình - Khoảng 20-30 cases):** Giả lập người dùng thật thao tác trên trình duyệt từ đầu đến cuối (Ví dụ: Đăng nhập -> Vào trang Quản lý -> Thêm sản phẩm -> Đăng xuất).

---

## 2. Danh sách một số Test Cases Tiêu Biểu (Top Priority)

Dưới đây là danh sách các Test Case quan trọng nhất mang tính sống còn đối với dự án:

### Phân hệ: Quản lý Sản Phẩm & Nhập liệu (Products)
* **TC_PROD_01:** Test Component `ImportProductsModal` hiển thị lỗi khi người dùng upload sai định dạng file (không phải `.xlsx`, `.csv`).
* **TC_PROD_02:** Test gửi Request Import thành công: Component gọi hàm `productAPI.importProducts` chính xác với tham số FormData chứa 1 trường `File` duy nhất.
* **TC_PROD_03:** Test Form tạo mới sản phẩm báo lỗi khi người dùng bỏ trống trường bắt buộc (Tên sản phẩm, Giá).

### Phân hệ: Thanh toán & Gói cước (Billing / PayOS)
* **TC_BILL_01:** Test Component `BillingManager` tự động hiển thị nút "Hủy đơn" (Cancel) màu đỏ thay vì "Thanh toán tiếp" khi có đơn hàng trạng thái `Pending`.
* **TC_BILL_02:** Test hành động Hủy đơn: Khi nhấn Hủy đơn và Xác nhận (Confirm OK) -> Gọi API `cancelPayment` -> Trạng thái cập nhật lại thành `Cancelled`.
* **TC_BILL_03:** Test Đăng ký gói cước mới: Nếu có đơn `Pending` cũ, hệ thống phải tự động hỏi người dùng có muốn hủy đơn cũ không. Nếu từ chối, không gọi API tạo link thanh toán mới.

### Phân hệ: RAG Chatbot (Chat UI)
* **TC_CHAT_01:** Test ô nhập tin nhắn tự động bị disable (vô hiệu hóa) và hiện icon loading (Typing...) khi đang chờ phản hồi từ AI.
* **TC_CHAT_02:** Test render luồng tin nhắn: Tin nhắn của bot phải hiển thị bên trái, của người dùng bên phải.

---

## 3. Cách Cài đặt và Sử dụng (Tech Stack)

Để chạy các Test Case trong dự án Next.js này, chúng ta sử dụng các thư viện chuẩn công nghiệp:

### A. Công cụ cài đặt
1. **Jest & React Testing Library (RTL):** Dành cho Unit & Integration Test.
2. **Cypress** hoặc **Playwright:** Dành cho E2E Test.

### B. Cài đặt nhanh (Terminal)
Bạn cần chạy lệnh sau tại thư mục gốc của dự án (`smart-shopping-chatbot`):
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

Và cấu hình file `jest.config.js` cơ bản cho Next.js.

---

## 4. Cách Hoạt Động Chi Tiết (Kèm Code Mẫu)

Test case hoạt động theo mô hình **AAA (Arrange - Act - Assert)**:
1. **Arrange (Chuẩn bị):** Mock (Giả lập) các API, render component ra một môi trường DOM ảo (JSDOM).
2. **Act (Hành động):** Giả lập người dùng click chuột, gõ phím, upload file.
3. **Assert (Xác nhận):** Kiểm tra xem màn hình có hiện đúng thông báo lỗi/thành công như mong đợi hay không.

### 📝 Mẫu Test Case 1: Kiểm thử `ImportProductsModal` khi upload sai file

Tạo một file: `src/components/business/products/__tests__/ImportProductsModal.test.tsx`

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportProductsModal } from '../ImportProductsModal';
import { toast } from 'react-hot-toast';

// Mock thư viện toast để kiểm tra xem nó có được gọi không
jest.mock('react-hot-toast');

describe('ImportProductsModal Component', () => {
  it('phải hiển thị thông báo lỗi khi upload file sai định dạng (ví dụ: .png)', () => {
    // 1. Arrange: Render modal lên màn hình ảo
    render(
      <ImportProductsModal 
        tenantId="test-tenant" 
        isOpen={true} 
        onClose={() => {}} 
        onSuccess={() => {}} 
      />
    );

    // 2. Act: Tìm ô input file và giả lập upload 1 file ảnh (.png)
    const fileInput = screen.getByTestId('import-file-input'); // Cần gán data-testid="import-file-input" cho thẻ <input type="file" />
    const file = new File(['dummy content'], 'image.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 3. Assert: Kiểm tra xem hàm toast.error có được bắn ra với thông báo chuẩn không
    expect(toast.error).toHaveBeenCalledWith('Vui lòng tải lên file CSV, Excel hoặc JSON');
  });
});
```

### 📝 Mẫu Test Case 2: Kiểm thử Nút "Hủy Đơn" trong Billing Manager gọi đúng API

Tạo file: `src/components/business/billing/__tests__/BillingManager.test.tsx`

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BillingManager } from '../BillingManager';
import { paymentAPI } from '@/infrastructure/api/subscriptionAPI';

// Mock API module để không gọi lên server thật
jest.mock('@/infrastructure/api/subscriptionAPI', () => ({
  paymentAPI: {
    getUserPayments: jest.fn(),
    cancelPayment: jest.fn(),
  },
  subscriptionAPI: { getAll: jest.fn() }
}));

describe('BillingManager Cancel Payment', () => {
  it('phải gọi api cancelPayment khi bấm Hủy Đơn', async () => {
    // 1. Arrange: Mock dữ liệu trả về là 1 đơn đang Pending
    const mockPendingPayment = [{ orderCode: 12345, status: 'Pending', amount: 500000 }];
    (paymentAPI.getUserPayments as jest.Mock).mockResolvedValue({ data: { items: mockPendingPayment } });
    
    // Bỏ qua hộp thoại window.confirm
    window.confirm = jest.fn().mockImplementation(() => true);

    render(<BillingManager />);

    // 2. Act: Chờ bảng tải xong, tìm nút Hủy Đơn và click
    const cancelButton = await screen.findByText(/Hủy đơn/i);
    fireEvent.click(cancelButton);

    // 3. Assert: Chờ và xác nhận API cancelPayment được gọi với mã orderCode 12345
    await waitFor(() => {
      expect(paymentAPI.cancelPayment).toHaveBeenCalledWith(12345);
    });
  });
});
```

---

## 5. Lợi ích khi tích hợp Test Cases vào dự án này

1. **Chặn Đứng Lỗi Hồi Quy (Regression):** Các bản cập nhật sau này (ví dụ: sửa Frontend Payment) sẽ không bao giờ vô tình làm hỏng các tính năng cũ đã được viết test.
2. **Khẳng định Tự Tin khi Release:** Trước khi `npm run build` lên Vercel, nếu `npm test` trả về `100% Passed`, bạn có thể yên tâm tính năng chạy đúng.
3. **Hiểu Hệ Thống Tốt Hơn:** Những người mới vào dự án chỉ cần đọc bộ Test Cases là sẽ nắm ngay các Use Case và luồng đi (User Flow) của hệ thống.
