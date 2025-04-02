import { Shipment, ShipmentStatus } from '../entities/Shipment.js';

export interface IShipmentService {
  getAllShipments(): Promise<Shipment[]>;
  createShipment(shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment>;
  processShipment(id: string): Promise<Shipment>;
  getShipment(id: string): Promise<Shipment>;
  getUserShipments(userId: string): Promise<Shipment[]>;
  updateShipmentStatus(id: string, status: ShipmentStatus): Promise<Shipment>;
  deleteShipment(id: string): Promise<void>;
} 