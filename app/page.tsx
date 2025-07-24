import PasswordGate from "@/components/auth/password-gate"
import FlowArtGenerator from "@/components/flow-art-generator"

export default function Home() {
  const password = process.env.NEXT_PUBLIC_PASSWORD_GATE_PASSWORD

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {password ? (
        <PasswordGate password={password}>
          <FlowArtGenerator />
        </PasswordGate>
      ) : (
        <FlowArtGenerator />
      )}
    </main>
  )
}
