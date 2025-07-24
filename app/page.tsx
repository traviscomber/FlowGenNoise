import FlowArtGenerator from "@/components/flow-art-generator"

export default function Home() {
  // You can wrap FlowArtGenerator with PasswordGate if you want to protect it
  // For example:
  // return (
  //   <PasswordGate>
  //     <FlowArtGenerator />
  //   </PasswordGate>
  // )
  return <FlowArtGenerator />
}
