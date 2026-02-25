"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirection /modules/contracts/simulator → /modules/contracts/simulateur */
export default function ContractsSimulatorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/contracts/simulateur");
  }, [router]);
  return null;
}
