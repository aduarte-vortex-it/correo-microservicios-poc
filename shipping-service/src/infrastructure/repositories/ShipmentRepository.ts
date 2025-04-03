import { IShipmentRepository } from '../../domain/repositories/IShipmentRepository.js';
import { Shipment, ShipmentStatus } from '../../domain/entities/Shipment.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../../config/index.js';

export class ShipmentRepository implements IShipmentRepository {
  private readonly sqsClient: SQSClient;
  // Almacenamiento en memoria para simular persistencia
  private shipments: Map<string, Shipment> = new Map();

  constructor() {
    console.log('[ShipmentRepository] Initializing with AWS region:', config.aws.region);
    this.sqsClient = new SQSClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      }
    });
  }

  async save(shipment: Shipment): Promise<Shipment> {
    console.log('[ShipmentRepository] Saving shipment with ID:', shipment.id);
    try {
      // Guardar en memoria
      this.shipments.set(shipment.id, shipment);
      
      // Verificar si la cola es FIFO
      const isFifoQueue = config.aws.sqsQueueUrl.endsWith('.fifo');
      console.log('[ShipmentRepository] Queue is FIFO:', isFifoQueue);
      
      // Preparar comando con parámetros adicionales para FIFO si es necesario
      const command = new SendMessageCommand({
        QueueUrl: config.aws.sqsQueueUrl,
        MessageBody: JSON.stringify(shipment),
        // Parámetros requeridos para colas FIFO
        ...(isFifoQueue && {
          MessageGroupId: shipment.userId || 'default', // Usar userId como MessageGroupId o 'default'
          MessageDeduplicationId: shipment.id // Usar el ID del envío como MessageDeduplicationId
        })
      });

      console.log('[ShipmentRepository] Sending message to SQS queue:', config.aws.sqsQueueUrl);
      await this.sqsClient.send(command);
      console.log('[ShipmentRepository] Successfully sent message to SQS');
      return shipment;
    } catch (error) {
      console.error('[ShipmentRepository] Error saving shipment:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Shipment | null> {
    console.log('[ShipmentRepository] Finding shipment by ID:', id);
    const shipment = this.shipments.get(id) || null;
    if (shipment) {
      console.log('[ShipmentRepository] Shipment found:', JSON.stringify(shipment));
    } else {
      console.log('[ShipmentRepository] Shipment not found for ID:', id);
    }
    return shipment;
  }

  async findByUserId(userId: string): Promise<Shipment[]> {
    console.log('[ShipmentRepository] Finding shipments for user ID:', userId);
    const userShipments = Array.from(this.shipments.values())
      .filter(shipment => shipment.userId === userId);
    console.log('[ShipmentRepository] Found', userShipments.length, 'shipments for user');
    return userShipments;
  }

  async updateStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    console.log('[ShipmentRepository] Updating status for shipment ID:', id, 'to:', status);
    const shipment = this.shipments.get(id);
    if (!shipment) {
      console.error('[ShipmentRepository] Shipment not found for ID:', id);
      throw new Error('Shipment not found');
    }

    shipment.status = status;
    shipment.updatedAt = new Date();
    this.shipments.set(id, shipment);
    
    // También enviar la actualización a SQS
    try {
      // Verificar si la cola es FIFO
      const isFifoQueue = config.aws.sqsQueueUrl.endsWith('.fifo');
      
      const command = new SendMessageCommand({
        QueueUrl: config.aws.sqsQueueUrl,
        MessageBody: JSON.stringify({ ...shipment, action: 'UPDATE_STATUS' }),
        // Parámetros requeridos para colas FIFO
        ...(isFifoQueue && {
          MessageGroupId: shipment.userId || 'default',
          MessageDeduplicationId: `${shipment.id}-${Date.now()}` // Asegurar unicidad
        })
      });
      
      console.log('[ShipmentRepository] Sending status update to SQS');
      await this.sqsClient.send(command);
      console.log('[ShipmentRepository] Successfully sent status update to SQS');
    } catch (error) {
      console.error('[ShipmentRepository] Error sending status update to SQS:', error);
      // No propagamos el error para no afectar la actualización local
    }
    
    return shipment;
  }

  async delete(id: string): Promise<void> {
    console.log('[ShipmentRepository] Deleting shipment with ID:', id);
    if (!this.shipments.has(id)) {
      console.error('[ShipmentRepository] Shipment not found for deletion, ID:', id);
      throw new Error('Shipment not found');
    }
    
    const shipment = this.shipments.get(id);
    this.shipments.delete(id);
    
    // Notificar eliminación a SQS
    try {
      // Verificar si la cola es FIFO
      const isFifoQueue = config.aws.sqsQueueUrl.endsWith('.fifo');
      
      const command = new SendMessageCommand({
        QueueUrl: config.aws.sqsQueueUrl,
        MessageBody: JSON.stringify({ id, action: 'DELETE' }),
        // Parámetros requeridos para colas FIFO
        ...(isFifoQueue && {
          MessageGroupId: shipment?.userId || 'default',
          MessageDeduplicationId: `${id}-delete-${Date.now()}`
        })
      });
      
      console.log('[ShipmentRepository] Sending deletion notification to SQS');
      await this.sqsClient.send(command);
      console.log('[ShipmentRepository] Successfully sent deletion notification to SQS');
    } catch (error) {
      console.error('[ShipmentRepository] Error sending deletion notification to SQS:', error);
      // No propagamos el error para no afectar la eliminación local
    }
  }

  async findAll(): Promise<Shipment[]> {
    console.log('[ShipmentRepository] Finding all shipments');
    const allShipments = Array.from(this.shipments.values());
    console.log('[ShipmentRepository] Found', allShipments.length, 'shipments in total');
    return allShipments;
  }
} 