import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | GPS Tanamur - Fleet Management System"
        description="Create your GPS Tanamur account to start managing your fleet and tracking vehicles."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
