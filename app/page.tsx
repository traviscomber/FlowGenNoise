import FlowArtGenerator from "@/components/flow-art-generator"
import PasswordGate from "@/components/auth/password-gate"

export default function Home() {
  return (
    <PasswordGate>
      <FlowArtGenerator />
    </PasswordGate>
  )
}
