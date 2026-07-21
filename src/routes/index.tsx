import { createFileRoute } from "@tanstack/react-router";
import GalaxyExplorer from "@/components/GalaxyExplorer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Star Chart Saga — Galaxy Explorer" },
      {
        name: "description",
        content:
          "Drift through the hyperlane chart, then enter Orbit to customise your card, collect colleagues, and earn XP on Riskara.",
      },
      { property: "og:title", content: "Star Chart Saga — Galaxy Explorer" },
      {
        property: "og:description",
        content:
          "Slick galaxy landing meets deep Orbit onboarding — quizzes, cards, and your real colleagues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <GalaxyExplorer />;
}
