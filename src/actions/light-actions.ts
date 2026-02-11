"use server";

import { revalidatePath } from "next/cache";

export async function toggleLightAction(id: string, token: string) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";


    try {
        const res = await fetch(`${apiUrl}/api/dashboard/lights/${id}/toggle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[Action] Failed to toggle light: ${res.status} ${res.statusText}`);
            return { success: false, error: res.statusText };
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[Action] Error toggling light:", error);
        return { success: false, error: "Network error" };
    }
}

export async function updateLightAction(id: string, token: string, body: any) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";


    try {
        const res = await fetch(`${apiUrl}/api/dashboard/lights/${id}/state`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[Action] Failed to update light: ${res.status} ${res.statusText}`);
            return { success: false, error: res.statusText };
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[Action] Error updating light:", error);
        return { success: false, error: "Network error" };
    }
}
