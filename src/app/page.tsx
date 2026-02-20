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

  if (!session) {
    await signIn("google");
    return null;
  }

  let lights: Light[] = [];
  let sensors: Sensor[] = [];
  let blinds: Blind[] = [];
  let weather: WeatherDto[] = [];
  let error = null;
  let shouldRedirect = false;

  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://lundedev-core:8080";

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
    redirect("/api/auth/signin?callbackUrl=/");
  }

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

        {weather.length > 0 && (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weather.map((w) => (
                <WeatherCard key={w.location} weather={w} />
              ))}
            </div>
          </section>
        )}

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

        {/* @ts-expect-error - session type extension */}
        <LiveLightGrid initialLights={lights} token={session.idToken} />
      </div>
    </main>
  );
}
