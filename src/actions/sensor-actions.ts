
"use server";

const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";

export async function getSensorsAction(token: string) {

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
        return { success: false, error: "Network error" };
    }
}
