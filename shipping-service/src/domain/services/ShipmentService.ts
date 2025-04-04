import { IShipmentService } from './IShipmentService.js';
import { IShipmentRepository } from '../repositories/IShipmentRepository.js';
import { Shipment, ShipmentStatus } from '../entities/Shipment.js';
import { v7 as uuidv7 } from 'uuid';

export class ShipmentService implements IShipmentService {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async createShipment(shipmentData: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment> {
    console.log('[ShipmentService] Creating new shipment with data:', JSON.stringify(shipmentData));
    const shipment: Shipment = {
      ...shipmentData,
      id: uuidv7(),
      status: ShipmentStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('[ShipmentService] Generated new shipment with ID:', shipment.id);
    return this.shipmentRepository.save(shipment);
  }

  async processShipment(id: string): Promise<Shipment> {
    console.log('[ShipmentService] Processing shipment with ID:', id);
    const shipment = await this.shipmentRepository.findById(id);
    if (!shipment) {
      console.error('[ShipmentService] Shipment not found:', id);
      throw new Error('Shipment not found');
    }

    shipment.status = ShipmentStatus.PROCESSING;
    shipment.updatedAt = new Date();
    console.log('[ShipmentService] Updated shipment status to PROCESSING');
    return this.shipmentRepository.save(shipment);
  }

  async getShipment(id: string): Promise<Shipment> {
    console.log('[ShipmentService] Getting shipment with ID:', id);
    const shipment = await this.shipmentRepository.findById(id);
    if (!shipment) {
      console.error('[ShipmentService] Shipment not found:', id);
      throw new Error('Shipment not found');
    }
    return shipment;
  }

  async getUserShipments(userId: string): Promise<Shipment[]> {
    console.log('[ShipmentService] Getting shipments for user ID:', userId);
    const shipments = await this.shipmentRepository.findByUserId(userId);
    console.log('[ShipmentService] Found', shipments.length, 'shipments for user');
    return shipments;
  }

  async updateShipmentStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    console.log('[ShipmentService] Updating status for shipment ID:', id, 'to:', status);
    return this.shipmentRepository.updateStatus(id, status);
  }

  async deleteShipment(id: string): Promise<void> {
    console.log('[ShipmentService] Deleting shipment with ID:', id);
    await this.shipmentRepository.delete(id);
  }

  async getAllShipments(): Promise<Shipment[]> {
    console.log('[ShipmentService] Getting all shipments');
    const shipments = await this.shipmentRepository.findAll();
    console.log('[ShipmentService] Found', shipments.length, 'shipments');
    return shipments;
  }
} 