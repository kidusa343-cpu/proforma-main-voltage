"use client";
import { Proforma } from "@/lib/utils"
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export async function signup(userData: { usernameOrEmail: string; password: string }) {
  console.log(userData);
  
  try {
    if (!userData || !userData.usernameOrEmail || !userData.password) {
      throw new Error('signup: usernameOrEmail and password are required');
    }
    const result = await window.electronAPI.signup(userData);
    return result;
  } catch (error) {
    console.error('Signup failed in electronUtils:', error);
    throw error;
  }
}

export async function login(userData: { usernameOrEmail: string; password: string }) {
  try {
    if (!userData || !userData.usernameOrEmail || !userData.password) {
      throw new Error('login: usernameOrEmail and password are required');
    }
    console.log('electronUtils: Calling window.electronAPI.login with:', userData);
    const result = await window.electronAPI.login(userData);
    console.log('electronUtils: window.electronAPI.login result:', result);
    return result;
  } catch (error) {
    console.error('Login failed in electronUtils:', error);
    throw error;
  }
}

export async function getAllProformas() {
  try {
    const result = await window.electronAPI.getAllProformas();
    return result;
  } catch (error) {
    console.error('Failed to fetch proformas:', error);
    throw error;
  }
}


export async function logout() {
  try {
    const result = await window.electronAPI.clearAuthToken();
    return result;
  } catch (error) {
    console.error('Failed to clear auth token:', error);
    throw error;
  }
}

export async function generateProformaNumber(): Promise<string> {
  try {
    const proformaNumber = await window.electronAPI.generateProformaNumber();
    return proformaNumber;
  } catch (error) {
    console.error("Failed to generate proforma number:", error);
    throw error;
  }
}

// export async function createProforma(proformaData:Proforma ) {
//   try {
//     const result = await window.electronAPI.createProforma(proformaData);
//     return result;
//   } catch (error) {
//     console.error('Failed to create proforma:', error);
//     throw error;
//   }
// }

export async function createProforma(proformaData: Proforma): Promise<Proforma> {
  try {
    const dataToSend: Proforma = {
      ...proformaData,
      proformaNumber: proformaData.proformaNumber ?? undefined, // Redundant now, but kept for clarity
    };
    const result = await window.electronAPI.createProforma(dataToSend);
    return result;
  } catch (error) {
    console.error("Failed to create proforma:", error);
    throw error;
  }
}