# Cấu hình Resend cho Silkmoon

## 1. Xác minh domain gửi mail

1. Đăng nhập Resend, mở **Domains** và thêm `updates.silkmoon.vn`.
2. Resend sẽ cung cấp các bản ghi SPF, DKIM và MX riêng cho tài khoản.
3. Vào Tenten: **Tên miền → silkmoon.vn → Cài đặt DNS**.
4. Thêm nguyên văn từng record Resend cung cấp. Không tự thay đổi Name, Type hoặc Value.
5. Quay lại Resend và bấm **Verify DNS Records**. Chỉ tiếp tục khi trạng thái là **Verified**.

Resend khuyến nghị dùng subdomain gửi mail để tách uy tín gửi mail khỏi domain website chính.

## 2. Tạo API key

Trong Resend mở **API Keys → Create API Key**, cấp quyền gửi mail rồi sao chép key. Key chỉ hiển thị một lần và không được commit vào Git.

## 3. Cấu hình backend trên EC2

Mở `~/silkmoon/backend/.env` và thêm:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
MAIL_FROM=Silkmoon <no-reply@updates.silkmoon.vn>
FRONTEND_URL=https://silkmoon.vn
```

`MAIL_FROM` phải dùng đúng domain hoặc subdomain đã được Resend xác minh.

Build và khởi động lại backend:

```bash
cd ~/silkmoon
npm run build -w backend
pm2 restart all --update-env
```

## 4. Kiểm tra

- Nhập một email vào form nhận ưu đãi ở Footer. Dữ liệu phải xuất hiện trong Admin → **Đăng ký nhận ưu đãi**.
- Email mới sẽ nhận mail xác nhận nếu Resend hoạt động. Lỗi gửi mail không làm mất bản đăng ký trong MongoDB.
- Trong trang admin có thể soạn tiêu đề/nội dung và gửi tới toàn bộ email có trạng thái **Đang nhận**.
- Resend batch giới hạn 100 email mỗi request; backend tự chia danh sách thành từng nhóm 100.
- Số điện thoại được lưu để chăm sóc khách hàng nhưng không được gửi qua Resend.
