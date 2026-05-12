import { loginAction } from "./actions";
import styles from "./login.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <p className={styles.eyebrow}>Thiệp mời của Duy Anh</p>
        <h1>Khum biết bạn là ai mà mò được ra đây cũng nể đấy :)))</h1>
        <p>Trang này chỉ dành cho admin tạo và quản lý thiệp mời.</p>
      </section>

      <section className={styles.loginCard} aria-labelledby="login-title">
        <div>
          <p className={styles.eyebrow}>Admin Login</p>
          <h2 id="login-title">Đăng nhập</h2>
        </div>

        <form className={styles.form} action={loginAction}>
          <label>
            Tài khoản
            <input name="username" placeholder="Nhap tai khoan" autoComplete="username" required />
          </label>

          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              placeholder="Nhap mat khau"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className={styles.error}>Sai tài khoản hoặc mật khẩu.</p> : null}

          <button className={styles.submit} type="submit">
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  );
}
