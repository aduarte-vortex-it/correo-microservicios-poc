import { IShipmentService } from './IShipmentService';
import { IShipmentRepository } from '../repositories/IShipmentRepository';
import { Shipment, ShipmentStatus } from '../entities/Shipment';
import { v4 as uuidv4 } from 'uuid';

export class ShipmentService implements IShipmentService {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async createShipment(shipmentData: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment> {
    const shipment: Shipment = {
      ...shipmentData,
      id: uuidv4(),
      status: ShipmentStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.shipmentRepository.save(shipment);
  }

  async processShipment(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    shipment.status = ShipmentStatus.PROCESSING;
    shipment.updatedAt = new Date();
    return this.shipmentRepository.save(shipment);
  }

  async getShipment(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    return shipment;
  }

  async getUserShipments(userId: string): Promise<Shipment[]> {
    return this.shipmentRepository.findByUserId(userId);
  }

  async updateShipmentStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    return this.shipmentRepository.updateStatus(id, status);
  }

  async deleteShipment(id: string): Promise<void> {
    await this.shipmentRepository.delete(id);
  }
} 