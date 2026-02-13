import { DashboardCard } from "./DashboardCard"
import { Cloud, CloudRain, Sun, CloudSun, Snowflake } from "lucide-react"

export interface WeatherDto {
    location: string
    temperature: number
    symbolCode: string
    precipitationAmount?: number
}

interface WeatherCardProps {
    weather: WeatherDto
}

export function WeatherCard({ weather }: WeatherCardProps) {
    const getWeatherIcon = (symbol: string) => {
        // Simple mapping, can be expanded based on Yr.no symbols
        if (symbol.includes("sun") || symbol.includes("clear")) return <Sun className="h-8 w-8 text-yellow-500" />
        if (symbol.includes("rain")) return <CloudRain className="h-8 w-8 text-blue-500" />
        if (symbol.includes("snow")) return <Snowflake className="h-8 w-8 text-blue-300" />
        if (symbol.includes("cloud")) return <Cloud className="h-8 w-8 text-gray-400" />
        return <CloudSun className="h-8 w-8 text-gray-500" />
    }

    return (
        <DashboardCard title={weather.location} className="hover:scale-105 transition-transform cursor-default p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <div className="text-2xl font-bold text-gray-100">{weather.temperature.toFixed(1)}°</div>
                    <p className="text-xs text-gray-400 capitalize">
                        {weather.symbolCode.replace(/_/g, ' ')}
                    </p>
                </div>
                {getWeatherIcon(weather.symbolCode)}
            </div>
        </DashboardCard>
    )
}
