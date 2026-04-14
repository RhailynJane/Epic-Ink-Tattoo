export function assertAdminKey(provided: string | undefined) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    throw new Error(
      "ADMIN_API_KEY is not configured on the Convex deployment. " +
        "Set it via `npx convex env set ADMIN_API_KEY <long-random-string>`."
    );
  }
  if (!provided) {
    throw new Error("Admin key is required for this operation.");
  }
  if (provided.length !== expected.length) {
    throw new Error("Invalid admin key.");
  }
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) {
    throw new Error("Invalid admin key.");
  }
}
