import { PasswordGate } from "@/components/auth/password-gate"
import { FlowArtGenerator } from "@/components/flow-art-generator"

export default function HomePage() {
  return (
    <PasswordGate correctPassword="flowsketch2024">
      <FlowArtGenerator />
    </PasswordGate>
  )
}
