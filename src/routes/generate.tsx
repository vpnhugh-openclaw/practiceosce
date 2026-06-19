import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/generate")({
  beforeLoad: async () => {
    throw redirect({ to: "/cases" });
  },
});
