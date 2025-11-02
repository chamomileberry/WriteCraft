import { auth, googleProvider } from "./firebase";
import { signInWithRedirect } from "firebase/auth";

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export async function signInWithGoogle() {
  try {
    // This will redirect the user to the Google sign-in page.
    // The user will be redirected back to the app after signing in.
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    // Handle Errors here.
    console.error("Error starting redirect sign-in:", error);
  }
}
