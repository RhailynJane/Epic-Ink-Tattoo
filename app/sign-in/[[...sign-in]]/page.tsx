import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary">
            Epic Ink Tattoo
          </h1>
          <p className="mt-2 text-foreground/60">Admin Sign In</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-lg",
            },
          }}
          fallbackRedirectUrl="/admin"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
