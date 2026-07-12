import { useState } from "react";
import { adminApi } from "../services/api";
import silkmoonLogo from "../../../frontend/src/assets/xanh_ngang.png";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token, user } = await adminApi.login(email, password);
      if (user.role !== "admin")
        throw new Error("Tài khoản này không có quyền quản trị.");
      localStorage.setItem("admin_token", access_token);
      onLoginSuccess();
    } catch (err) {
      setError(
        err.message === "Login failed"
          ? "Email hoặc mật khẩu không chính xác."
          : err.message || "Không thể đăng nhập.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand-mark">
          <img
            className="brand-logo login-brand-logo"
            src={silkmoonLogo}
            alt="Silkmoon - Premium Bedding & Sleepwear"
          />
        </div>
        <div className="login-quote">
          <p>
            Chăm chút giấc ngủ,
            <br />
            nâng niu từng khoảnh khắc.
          </p>
          <span>KHÔNG GIAN QUẢN TRỊ SILKMOON</span>
        </div>
      </section>
      <section className="login-form-area">
        <form className="login-form" onSubmit={handleSubmit}>
          <span className="login-eyebrow">QUẢN TRỊ CỬA HÀNG</span>
          <h1>Chào mừng trở lại</h1>
          <p className="login-intro">
            Đăng nhập để quản lý sản phẩm, đơn hàng và khách hàng của Silkmoon.
          </p>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <label className="form-field">
            <span>ĐỊA CHỈ EMAIL</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@silkmoon.vn"
              autoComplete="email"
              required
            />
          </label>
          <label className="form-field">
            <span>MẬT KHẨU</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
          <p className="login-note">
            Khu vực dành riêng cho nhân viên được ủy quyền.
          </p>
        </form>
      </section>
    </main>
  );
}
