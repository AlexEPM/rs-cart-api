import {Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req} from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import {OrderService} from '../order';
import {AppRequest, getUserIdFromRequest} from '../shared';

import {calculateCartTotal} from './models-rules';
import {CartService} from './services';

@Controller('api/profile/cart')
export class CartController {
  constructor(
      private cartService: CartService,
      private orderService: OrderService
  ) { }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get(':userId')
  async findUserCart(@Param('userId') userId: string) {
    const cart = await this.cartService.findOrCreateByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { cart, total: calculateCartTotal(cart) },
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Body() body) { // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(body.userId, body.cart)

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart,
        total: calculateCartTotal(cart),
      }
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete(':userId')
  async clearUserCart(@Param('userId') userId: string) {
    await this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const cart = await this.cartService.findByUserId(body.userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode

      return {
        statusCode,
        message: 'Cart is empty',
      }
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(cart);
    const order = this.orderService.create({
      ...body, // TODO: validate and pick only necessary data
      userId: body.userId,
      cartId,
      items,
      total,
    });
    await this.cartService.removeByUserId(body.userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { order }
    }
  }
}
