import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  // Handle Login State
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Welcome to Lundedev
        </h1>
        <p className="mb-12 text-zinc-400 text-lg">
          Please sign in to access the dashboard.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-white text-zinc-900 font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </form>
      </main>
    );
  }

  // Handle Authenticated State
  console.log("SESSION OBJECT:", JSON.stringify(session, null, 2));

  let apiData: { message: string, user: string, email: string } | null = null;
  let error = null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiUrl}/api/hello`, {
      headers: {
        // @ts-expect-error - session type extension
        Authorization: `Bearer ${session.idToken}`
      },
      cache: 'no-store'
    });

    // Read response as text first for debugging
    const rawText = await res.text();
    console.log("API STATUS:", res.status);
    console.log("API RAW BODY (First 500 chars):", rawText.slice(0, 500));

    if (res.ok) {
      try {
        apiData = JSON.parse(rawText);
      } catch (e) {
        console.error("JSON PARSE ERROR:", e);
        error = "Invalid API Response (Not JSON)";
      }
    } else {
      error = `API Error: ${res.status} ${res.statusText}`;
    }
  } catch (e) {
    console.error("Failed to fetch API", e);
    error = "Failed to connect to backend service.";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex justify-between items-center mb-8 pb-8 border-b border-zinc-800">
          <h2 className="text-2xl font-light text-zinc-100">Profile</h2>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        {apiData ? (
          <div className="space-y-4 font-mono text-zinc-300">
            <p className="text-xl text-blue-400 mb-6">{apiData.message}</p>
            <div className="bg-black/50 p-6 rounded-lg border border-zinc-800/50">
              <div className="grid grid-cols-[80px_1fr] gap-4">
                <span className="text-zinc-500">user:</span>
                <span className="text-zinc-100">{apiData.user}</span>

                <span className="text-zinc-500">email:</span>
                <span className="text-zinc-100">{apiData.email}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded bg-red-900/10 border border-red-900/20 text-red-400">
            {error || "Loading..."}
          </div>
        )}
      </div>
    </main>
  );
}
