import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <h1 className="font-display text-xl font-semibold">Pagina niet gevonden</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Deze pagina bestaat niet (meer). Controleer de link, of ga terug naar het dashboard.
      </p>
      <Button asChild>
        <Link href="/">Naar het dashboard</Link>
      </Button>
    </div>
  );
}
