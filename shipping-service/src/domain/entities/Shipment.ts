export interface Shipment {
  id: string;
  userId: string;
  status: ShipmentStatus;
  origin: Address;
  destination: Address;
  weight: number;
  dimensions: Dimensions;
  createdAt: Date;
  updatedAt: Date;
}

export enum ShipmentStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
} 