// types/electron.d.ts
interface ElectronAPI {
  createProforma: (proformaData: ProformaData) => Promise<Proforma>;
  getAllProformas: () => Promise<Proforma[]>;
  signup: (userData: { usernameOrEmail: string; password: string }) => Promise<{ success: boolean; user?: { id: number; usernameOrEmail: string }; message?: string }>;
  login: (userData: { usernameOrEmail: string; password: string }) => Promise<{ success: boolean; user?: { id: number; usernameOrEmail: string }; message?: string }>;
  getAuthToken: () => Promise<string>;
  clearAuthToken: () => Promise<{ success: boolean }>;
  generateProformaNumber: () => Promise<string>;
}

interface Window {
  electronAPI: ElectronAPI;
}