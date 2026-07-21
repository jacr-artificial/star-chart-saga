import { createFileRoute } from "@tanstack/react-router";
import { StoreProvider } from "@/store";
import OrbitApp from "@/components/OrbitApp";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Orbit — Collect your colleagues" },
      {
        name: "description",
        content:
          "Customise your card, collect colleagues from the directory, and earn XP on Riskara.",
      },
    ],
  }),
  component: AppRoute,
});

function AppRoute() {
  return (
    <StoreProvider>
      <OrbitApp />
    </StoreProvider>
  );
}
