import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export default async function GeenOrganisatiePage() {
  const session = await requireSession();

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="max-w-md">
        <CardContent className="flex flex-col gap-3 text-center">
          <h1 className="font-display text-lg font-semibold">Nog geen toegang</h1>
          <p className="text-sm text-muted-foreground">
            Het account {session.email} is nog niet aan een organisatie gekoppeld. Vraag de
            beheerder van je organisatie om je toe te voegen.
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              Uitloggen
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
