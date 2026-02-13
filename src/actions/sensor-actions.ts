
"use server";

export async function getSensorsAction(token: string) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";

    try {
        const res = await fetch(`${apiUrl}/api/dashboard/sensors`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return { success: false, error: res.statusText };
        }
        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Action] Error fetching sensors:", error);
        return { success: false, error: "Network error" };
    }
}
