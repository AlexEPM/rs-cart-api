import {Injectable} from '@nestjs/common';

import {Order} from '../models';
import {InjectConnection, InjectRepository} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import {OrderEntity, STATUS} from '../../database/entities/order.entity';
import {CartItemEntity} from '../../database/entities/cart-item.entity';
import {cartItemEntityToCartItem, cartItemToCartItemEntity} from '../../cart';

const orderEntityToOrder = (entity: OrderEntity): Order => {
  const payment = JSON.parse(JSON.stringify(entity.payment));
  const delivery = JSON.parse(JSON.stringify(entity.delivery));

  return {
    id: entity.id,
    userId: entity.user_id,
    cartId: entity.cart_id,
    items: entity.items.map(cartItemEntityToCartItem),
    status: entity.status,
    comments: entity.comments,
    total: entity.total,
    payment: {
      type: payment.type,
      address: payment?.address,
      creditCard: payment?.creditCard
    },
    delivery: {
      type: delivery.type,
      address: delivery.address
    },
  };
};

const orderToOrderEntity = (order: Order): Omit<OrderEntity, 'id'> => {
  return {
    cart_id: order.cartId,
    user_id: order.userId,
    comments: order.comments,
    status: '',
    total: order.total,
    payment: JSON.parse(JSON.stringify(order.payment)),
    delivery: JSON.parse(JSON.stringify(order.delivery)),
    items: order.items.map((item) => cartItemToCartItemEntity(order.id, item) as CartItemEntity)
  }
};

@Injectable()
export class OrderService {
  constructor(
      @InjectRepository(OrderEntity)
      private readonly orderRepo: Repository<OrderEntity>,

      @InjectConnection() private readonly connection: Connection,
  ) {}

  async findById(orderId: string): Promise<Order> {
    try {
      const orderEntity = await this.orderRepo.findOneBy({ id: orderId })
      const order = orderEntityToOrder(orderEntity);

      return order;
    } catch (e) {
      console.log(e);
    }
  }

  async create(order: Order): Promise<Order> {
    try {
      const orderEntity = orderToOrderEntity(order);
      orderEntity.status = STATUS.IN_PROGRESS;
      const createdOrder = await this.orderRepo.insert(orderEntity);

      return {
        ...order,
        id: createdOrder.identifiers[0].id,
        status: STATUS.IN_PROGRESS
      };
    } catch (e) {
      console.log(e);
    }
  }

  async update(data: Order) {
    try {
      const order = await this.findById(data.id);

      if (!order) {
        return null;
      }

      const orderEntity = orderToOrderEntity(data);
      const updatedOrder = await this.orderRepo.save(orderEntity);

      return {
        ...data,
        id: updatedOrder.id
      }
    } catch (e) {
      console.log(e);
    }
  }
}
