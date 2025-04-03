import { Request, Response } from 'express';
import { IShipmentService } from '../../domain/services/IShipmentService.js';
import { Shipment } from '../../domain/entities/Shipment.js';

export class ShipmentController {
  constructor(private readonly shipmentService: IShipmentService) {}

  async createShipment(req: Request, res: Response): Promise<void> {
    console.log('[ShipmentController] Creating shipment with data:', JSON.stringify(req.body));
    try {
      const shipment = await this.shipmentService.createShipment(req.body);
      console.log('[ShipmentController] Shipment created successfully:', JSON.stringify(shipment));
      res.status(201).json(shipment);
    } catch (error) {
      console.error('[ShipmentController] Error creating shipment:', error);
      res.status(400).json({ error: 'Error creating shipment' });
    }
  }

  async getShipment(req: Request, res: Response): Promise<void> {
    console.log('[ShipmentController] Getting shipment with ID:', req.params.id);
    try {
      const shipment = await this.shipmentService.getShipment(req.params.id);
      console.log('[ShipmentController] Shipment found:', JSON.stringify(shipment));
      res.json(shipment);
    } catch (error) {
      console.error('[ShipmentController] Error getting shipment:', error);
      res.status(404).json({ error: 'Shipment not found' });
    }
  }

  async getUserShipments(req: Request, res: Response): Promise<void> {
    console.log('[ShipmentController] Getting shipments for user ID:', req.params.userId);
    try {
      const shipments = await this.shipmentService.getUserShipments(req.params.userId);
      console.log('[ShipmentController] Found', shipments.length, 'shipments for user');
      res.json(shipments);
    } catch (error) {
      console.error('[ShipmentController] Error fetching user shipments:', error);
      res.status(400).json({ error: 'Error fetching shipments' });
    }
  }

  async updateShipmentStatus(req: Request, res: Response): Promise<void> {
    console.log('[ShipmentController] Updating status for shipment ID:', req.params.id, 'to status:', req.body.status);
    try {
      const shipment = await this.shipmentService.updateShipmentStatus(
        req.params.id,
        req.body.status
      );
      console.log('[ShipmentController] Shipment status updated successfully:', JSON.stringify(shipment));
      res.json(shipment);
    } catch (error) {
      console.error('[ShipmentController] Error updating shipment status:', error);
      res.status(400).json({ error: 'Error updating shipment status' });
    }
  }

  async deleteShipment(req: Request, res: Response): Promise<void> {
    console.log('[ShipmentController] Deleting shipment with ID:', req.params.id);
    try {
      await this.shipmentService.deleteShipment(req.params.id);
      console.log('[ShipmentController] Shipment deleted successfully');
      res.status(204).send();
    } catch (error) {
      console.error('[ShipmentController] Error deleting shipment:', error);
      res.status(400).json({ error: 'Error deleting shipment' });
    }
  }

  async getAllShipments(req: Request, res: Response): Promise<void> {
    console.log('[ShipmentController] Getting all shipments');
    try {
      const shipments = await this.shipmentService.getAllShipments();
      console.log('[ShipmentController] Found', shipments.length, 'shipments');
      res.json(shipments);
    } catch (error) {
      console.error('[ShipmentController] Error fetching all shipments:', error);
      res.status(500).json({ error: 'Error fetching all shipments' });
    }
  }
} 