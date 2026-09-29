import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export interface ProformaItem {
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  remarks: string;
}
export interface Proforma {
  validityInDays: number;
  proformaNumber?: string;
  customerName: string;
  plateNumber: string;
  vin: string;
  model: string;
  referenceNumber?: string;
  deliveryTime: string;
  preparedBy: string;
  dateCreated: string;
  items: ProformaItem[];
}
