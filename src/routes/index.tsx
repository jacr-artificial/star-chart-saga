import { createFileRoute } from "@tanstack/react-router";
import SpaceBackground from "@/components/SpaceBackground";
import Onboarding from "@/screens/Onboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Star Chart Saga — Begin your orbit" },
      {
        name: "description",
        content:
          "Drop your CV and we'll find your place in the galaxy — an insurance-themed onboarding with cards, quizzes, and a living orrery.",
      },
      { property: "og:title", content: "Star Chart Saga — Begin your orbit" },
      {
        property: "og:description",
        content:
          "Onboard into Hire Orbit: customise your card, collect colleagues, and earn XP on Riskara.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <SpaceBackground />
      <Onboarding />
    </div>
  );
}
