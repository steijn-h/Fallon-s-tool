import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/shared/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Inloggen</CardTitle>
          <CardDescription>Log in met je organisatie-account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo ?? "/profiles"} />
        </CardContent>
      </Card>
    </div>
  );
}
