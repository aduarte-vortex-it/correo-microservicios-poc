import { Request, Response } from 'express';
import { IShipmentService } from '../../domain/services/IShipmentService';
import { Shipment } from '../../domain/entities/Shipment';

export class ShipmentController {
  constructor(private readonly shipmentService: IShipmentService) {}

  async createShipment(req: Request, res: Response): Promise<void> {
    try {
      const shipment = await this.shipmentService.createShipment(req.body);
      res.status(201).json(shipment);
    } catch (error) {
      res.status(400).json({ error: 'Error creating shipment' });
    }
  }

  async getShipment(req: Request, res: Response): Promise<void> {
    try {
      const shipment = await this.shipmentService.getShipment(req.params.id);
      res.json(shipment);
    } catch (error) {
      res.status(404).json({ error: 'Shipment not found' });
    }
  }

  async getUserShipments(req: Request, res: Response): Promise<void> {
    try {
      const shipments = await this.shipmentService.getUserShipments(req.params.userId);
      res.json(shipments);
    } catch (error) {
      res.status(400).json({ error: 'Error fetching shipments' });
    }
  }

  async updateShipmentStatus(req: Request, res: Response): Promise<void> {
    try {
      const shipment = await this.shipmentService.updateShipmentStatus(
        req.params.id,
        req.body.status
      );
      res.json(shipment);
    } catch (error) {
      res.status(400).json({ error: 'Error updating shipment status' });
    }
  }

  async deleteShipment(req: Request, res: Response): Promise<void> {
    try {
      await this.shipmentService.deleteShipment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Error deleting shipment' });
    }
  }
} 