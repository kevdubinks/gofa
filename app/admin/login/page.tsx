import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginBand" aria-hidden="true" />
        <div className="loginBody">
          <span className="loginBadge">BOFA</span>
          <h1 className="loginTitle">Espace Admin</h1>
          <p className="loginSubtitle">Le goût du naturel !</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
