import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginPage } from "@/components/auth";

type Props = { searchParams: Promise<{ callbackUrl?: string; showEmailOption?: string }> };

export default async function LoginPageRoute({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null;
  const showEmailOption = params?.showEmailOption !== "false";

  return (
    <LoginPage
      title="Blueprint Modular"
      subtitle={showEmailOption ? "Connexion sécurisée (Google ou e-mail)" : "Connexion avec Google"}
      logoSrc="/img/logo-bpm-nom.jpg"
      callbackUrl={callbackUrl}
      showEmailOption={showEmailOption}
    />
  );
}
