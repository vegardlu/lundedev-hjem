import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { LiveLightGrid } from "@/components/dashboard/LiveLightGrid";
import { WeatherCard, WeatherDto } from "@/components/dashboard/WeatherCard";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SensorGroupCard, SensorProps } from "@/components/dashboard/SensorGroupCard";
import { BlindCard } from "@/components/dashboard/BlindCard";

interface Light {
  id: string;
  name: string;
  isOn: boolean;
  brightness?: number;
  area?: string;
  floor?: string;
  supportedColorModes?: string[];
}

interface Sensor extends SensorProps {
  area?: string;
  floor?: string;
}

interface Blind {
  id: string;
  name: string;
  state: string;
  currentPosition?: number;
  area?: string;
  floor?: string;
}

export default async function Home() {
  const session = await auth();

  // Handle Login State
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-950 text-zinc-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text text-center">
            Lundedev
          </h1>
          <p className="mb-8 text-zinc-400 text-lg text-center">
            Dashboard Access Required
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
            className="flex justify-center"
          >
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-white text-zinc-900 font-semibold hover:bg-zinc-200 transition-all duration-200 flex items-center gap-3 shadow-lg shadow-white/10"
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
        </div>
      </main>
    );
  }

  // Handle Authenticated State
  let lights: Light[] = [];
  let sensors: Sensor[] = [];
  let blinds: Blind[] = [];
  let weather: WeatherDto[] = [];
  let error = null;
  let shouldRedirect = false;

  try {
    // Determine API URL: Use server-side internal URL if available, otherwise public URL, finally fallback to localhost
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://lundedev-core:8080";
    console.log("Fetching dashboard data from:", apiUrl);

    const headers = {
      // @ts-expect-error - session type extension
      Authorization: `Bearer ${session.idToken}`
    }

    const [lightsRes, weatherRes, sensorsRes, blindsRes] = await Promise.all([
      fetch(`${apiUrl}/api/dashboard/lights`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/dashboard/weather`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/dashboard/sensors`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/dashboard/blinds`, { headers, cache: 'no-store' })
    ])

    if (lightsRes.status === 401 || lightsRes.status === 403) {
      shouldRedirect = true;
    } else {
      if (lightsRes.ok) lights = await lightsRes.json();
      else console.error(`Lights API Error: ${lightsRes.status}`);

      if (weatherRes.ok) weather = await weatherRes.json();
      else console.error(`Weather API Error: ${weatherRes.status}`);

      if (sensorsRes.ok) sensors = await sensorsRes.json();
      else console.error(`Sensors API Error: ${sensorsRes.status}`);

      if (blindsRes.ok) blinds = await blindsRes.json();
      else console.error(`Blinds API Error: ${blindsRes.status}`);

      if (!lightsRes.ok && !weatherRes.ok && !sensorsRes.ok && !blindsRes.ok) {
        error = "Failed to load dashboard data."
      }
    }
  } catch (e) {
    console.error("Failed to fetch dashboard API", e);
    error = "System unavailable.";
  }

  if (shouldRedirect) {
    console.log("Session expired or unauthorized. Redirecting to login...");
    redirect("/api/auth/signin?callbackUrl=/");
  }

  // Group sensors by area
  const sensorsByArea: Record<string, Sensor[]> = {};
  sensors.forEach(sensor => {
    const area = sensor.area || "Other";
    if (!sensorsByArea[area]) {
      sensorsByArea[area] = [];
    }
    sensorsByArea[area].push(sensor);
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-purple-500/20">
              LD
            </div>
            <h1 className="text-lg font-medium bg-gradient-to-r from-zinc-100 to-zinc-400 text-transparent bg-clip-text">
              Hjem
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-zinc-400 font-medium">{session.user?.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* 1. Chat Interface (Google Search Style) */}
        <section className="flex flex-col items-center justify-center pt-4 md:pt-10">
          {/* @ts-expect-error - session type extension */}
          <ChatInterface token={session.idToken} userName={session.user?.name} />
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-300 text-sm flex items-center gap-3 justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* 2. Weather Cards (Compact) */}
        {weather.length > 0 && (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weather.map((w) => (
                <WeatherCard key={w.location} weather={w} />
              ))}
            </div>
          </section>
        )}

        {/* 3. Sensors Grouped by Room */}
        {Object.keys(sensorsByArea).length > 0 && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(sensorsByArea).map(([area, areaSensors]) => (
                <div key={area} className="h-full">
                  <SensorGroupCard areaName={area} sensors={areaSensors} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Blinds */}
        {blinds.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-300">Blinds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {blinds.map((blind) => (
                <div key={blind.id} className="h-full">
                  <BlindCard
                    id={blind.id}
                    name={blind.name}
                    state={blind.state}
                    currentPosition={blind.currentPosition}
                    // @ts-expect-error - session type extension
                    token={session.idToken}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Lights Grouped by Floor and Room */}
        {/* @ts-expect-error - session type extension */}
        <LiveLightGrid initialLights={lights} token={session.idToken} />
      </div>
    </main>
  );
}
