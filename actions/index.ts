"use server";

export async function checkServerStatus() {
  return {
    status: "online",
    timestamp: new Date().toISOString(),
  };
}
