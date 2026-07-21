import { createFileRoute } from "@tanstack/react-router";
import GalaxyExplorer from "@/components/GalaxyExplorer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aetherion Archive — Galaxy Explorer" },
      {
        name: "description",
        content:
          "An immersive galaxy explorer of the Aetherion universe. Drift between worlds, uncover their lore, and chart the arms of a fictional spiral galaxy.",
      },
      { property: "og:title", content: "Aetherion Archive — Galaxy Explorer" },
      {
        property: "og:description",
        content:
          "Drift between 8 fictional worlds in an interactive spiral-galaxy worldbuilding experience.",
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
