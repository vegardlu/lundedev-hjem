"use server";

import { revalidatePath } from "next/cache";

export async function getBlindsAction(token: string) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";

    try {
        const res = await fetch(`${apiUrl}/api/dashboard/blinds`, {
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
        console.error("[Action] Error fetching blinds:", error);
        return { success: false, error: "Network error" };
    }
}

export async function setBlindPositionAction(id: string, token: string, position: number) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";

    try {
        const res = await fetch(`${apiUrl}/api/dashboard/blinds/${id}/position`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ position }),
            cache: 'no-store'
        });

        if (!res.ok) {
            return { success: false, error: res.statusText };
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[Action] Error setting blind position:", error);
        return { success: false, error: "Network error" };
    }
}

export async function openBlindAction(id: string, token: string) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";

    try {
        const res = await fetch(`${apiUrl}/api/dashboard/blinds/${id}/open`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return { success: false, error: res.statusText };
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[Action] Error opening blind:", error);
        return { success: false, error: "Network error" };
    }
}

export async function closeBlindAction(id: string, token: string) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";

    try {
        const res = await fetch(`${apiUrl}/api/dashboard/blinds/${id}/close`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return { success: false, error: res.statusText };
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[Action] Error closing blind:", error);
        return { success: false, error: "Network error" };
    }
}

export async function stopBlindAction(id: string, token: string) {
    const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";

    try {
        const res = await fetch(`${apiUrl}/api/dashboard/blinds/${id}/stop`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return { success: false, error: res.statusText };
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[Action] Error stopping blind:", error);
        return { success: false, error: "Network error" };
    }
}
