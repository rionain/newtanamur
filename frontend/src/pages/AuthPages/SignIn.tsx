import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | GPS Tanamur - Fleet Management System"
        description="Sign in to your GPS Tanamur account to manage your fleet and track vehicles in real-time."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
