import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginPage } from "@/components/auth";
import { getLocale } from "@/lib/i18n/server";

type Props = { searchParams: Promise<{ callbackUrl?: string; showEmailOption?: string; layout?: string }> };

export default async function LoginPageRoute({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const locale = await getLocale();
  const callbackUrl = params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null;
  const showEmailOption = params?.showEmailOption !== "false";
  const useSplitLayout = params?.layout === "split";

  const subtitle = showEmailOption
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
      logoSrc="/img/logo-bpm-nom.jpg"
      callbackUrl={callbackUrl}
      showEmailOption={showEmailOption}
      useSplitLayout={useSplitLayout}
    />
  );
}
