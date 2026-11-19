import { registrationEnabled } from "@/lib/auth/enrollment";
import { returnPath } from "@/lib/auth/return-path";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RegisterPage } from "@/components/auth";

type Props = { searchParams: Promise<{ callbackUrl?: string; layout?: string; mode?: string }> };

export default async function RegisterPageRoute({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = returnPath(params?.callbackUrl);
  const session = await getServerSession(authOptions);
  if (session) redirect(callbackUrl ?? "/dashboard");
  const useSplitLayout = params?.layout === "split";

  return (
    <RegisterPage
      title="Blueprint Modular"
      logoSrc="/Logo-BPM-nom.jpg"
      googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
      recovery={params?.mode === "recover"}
      emailEnabled={registrationEnabled()}
      callbackUrl={callbackUrl}
      useSplitLayout={useSplitLayout}
    />
  );
}
