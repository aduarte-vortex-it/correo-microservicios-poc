import { Shipment, ShipmentStatus } from '../entities/Shipment.js';

export interface IShipmentRepository {
  findAll(): Promise<Shipment[]>;
  save(shipment: Shipment): Promise<Shipment>;
  findById(id: string): Promise<Shipment | null>;
  findByUserId(userId: string): Promise<Shipment[]>;
  updateStatus(id: string, status: ShipmentStatus): Promise<Shipment>;
  delete(id: string): Promise<void>;
} 