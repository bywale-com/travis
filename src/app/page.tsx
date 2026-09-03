import { cookies } from "next/headers";
import { TravisApp } from "@/components/TravisApp";
import { CharacterProvider } from "@/theme/character";
import { LoginDoor } from "@/components/LoginDoor";
import { OPERATOR_COOKIE } from "@/lib/operator-auth";
import { operatorByToken } from "@/server/operator";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(OPERATOR_COOKIE)?.value ?? "";
  const operator = token
    ? await operatorByToken(token).catch(() => null)
    : null;
  return (
    <CharacterProvider>
      {operator ? <TravisApp /> : <LoginDoor />}
    </CharacterProvider>
  );
}
