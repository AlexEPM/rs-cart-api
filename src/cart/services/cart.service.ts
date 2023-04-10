import {Injectable} from '@nestjs/common';

import {Cart, CartItem, Product} from '../models';
import {InjectConnection, InjectRepository} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import {CartEntity, STATUS} from '../../database/entities/cart.entity';
import {CartItemEntity} from '../../database/entities/cart-item.entity'

export const cartItemEntityToCartItem = (entity: CartItemEntity): CartItem => {
  return {
    product: {
      id: entity.product_id,
      ...({} as Product)
    },
    count: entity.count
  }
};

export const cartItemToCartItemEntity = (id: string, item: CartItem): Omit<CartItemEntity, 'id'> => {
  return {
    cart_id: id,
    product_id: item.product.id,
    count: item.count
  };
};

const cartEntityToCart = ({ id, items }: CartEntity): Cart => {
  const cartItems = items.map(cartItemEntityToCartItem);

  return {
    id,
    items: cartItems
  };
};

@Injectable()
export class CartService {
  constructor(
      @InjectRepository(CartEntity)
      private readonly cartRepo: Repository<CartEntity>,

      @InjectConnection() private readonly connection: Connection,
  ) {}

  async findByUserId(userId: string): Promise<Cart> {
    try {
      const cartEntity = await this.cartRepo.findOne({
        where: {
          user_id: userId,
        },
        relations: {
          items: true,
        },
      });

      if (!cartEntity) {
        return null;
      }

      return cartEntityToCart(cartEntity);
    } catch (e) {
      console.log(e);
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    try {
      const currentDate = new Date();

      const insertResult = await this.cartRepo.insert({
        user_id: userId,
        created_at: currentDate,
        updated_at: currentDate,
        status: STATUS.OPEN
      });

      return {
        id: insertResult.identifiers[0].id,
        items: []
      };
    } catch (e) {
      console.log(e);
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    try {
      const cart = await this.findByUserId(userId);

      if (cart) {
        return cart;
      }

      return await this.createByUserId(userId);
    } catch (e) {
      console.log(e);
    }
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    try {
      const cartEntity = await this.cartRepo.findOneBy(
          { user_id: userId }
      );
      const cartForUpdate = {
        ...cartEntity,
        items: items.map(
            (item) => cartItemToCartItemEntity(cartEntity.id, item))
      };

      const updatedCart = await this.cartRepo.save(cartForUpdate);

      return cartEntityToCart(updatedCart);
    } catch (e) {
      console.log(e);
    }
  }

  async removeByUserId(userId): Promise<void> {
    try {
      await this.cartRepo.delete({ user_id: userId });
    } catch (e) {
      console.log(e);
    }
  }

  async softDeleteByUserId(userId: string): Promise<void> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      await this.cartRepo.update({ id: userCart.id}, { status: STATUS.ORDERED})
    }
  }

}
