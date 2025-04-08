import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Cart } from './entity.cart';

@Entity('cart_items')
export class CartItem {
  @PrimaryColumn({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int' })
  count: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: 'CASCADE' })
  cart: Cart;
}
