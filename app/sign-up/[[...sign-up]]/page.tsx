import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary">
            Epic Ink Tattoo
          </h1>
          <p className="mt-2 text-foreground/60">Create Admin Account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-lg",
            },
          }}
          fallbackRedirectUrl="/admin"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
