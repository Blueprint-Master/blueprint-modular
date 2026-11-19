import { returnPath } from "@/lib/auth/return-path";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginPage } from "@/components/auth";
import { getLocale } from "@/lib/i18n/server";

type Props = { searchParams: Promise<{ callbackUrl?: string; showEmailOption?: string; layout?: string }> };

export default async function LoginPageRoute({ searchParams }: Props) {
  const params = await searchParams;
  const locale = await getLocale();
  const callbackUrl = returnPath(params?.callbackUrl);
  const session = await getServerSession(authOptions);
  if (session) redirect(callbackUrl ?? "/dashboard");
  const showEmailOption = params?.showEmailOption !== "false";
  const useSplitLayout = params?.layout === "split";

  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const subtitle = !googleEnabled && showEmailOption ? (locale === "en" ? "Sign in with email" : "Connexion par e-mail") : showEmailOption
    ? locale === "en"
      ? "Secure sign-in (Google or email)"
      : "Connexion sécurisée (Google ou e-mail)"
    : locale === "en"
      ? "Sign in with Google"
      : "Connexion avec Google";

  return (
    <LoginPage
      title="Blueprint Modular"
      subtitle={subtitle}
      logoSrc="/Logo-BPM-nom.jpg"
      callbackUrl={callbackUrl}
      googleEnabled={googleEnabled}
      showEmailOption={showEmailOption}
      useSplitLayout={useSplitLayout}
    />
  );
}
