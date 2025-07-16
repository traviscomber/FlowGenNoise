import { FlowArtGenerator } from "@/components/flow-art-generator"
import { PasswordGate } from "@/components/auth/password-gate"

export default function Home() {
  // You can set a password here to gate access to the generator
  // For example: <PasswordGate correctPassword="your-secret-password">
  return (
    <PasswordGate>
      <FlowArtGenerator />
    </PasswordGate>
  )
}
