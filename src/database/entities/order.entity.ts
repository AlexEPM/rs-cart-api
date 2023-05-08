import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {CartEntity} from './cart.entity';
import {CartItemEntity} from './cart-item.entity';

export enum STATUS {
    IN_PROGRESS= 'inProgress',
    COMPLETED = 'completed'
}

@Entity({ name: 'orders'})
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', unique: true, nullable: false })
    user_id: string;

    @Column({ type: 'uuid', unique: false, nullable: false })
    @OneToOne(
        () => CartEntity,
        (cart) => cart.id,
        {  onUpdate: 'CASCADE', onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
    cart_id: string;

    @Column({ type: 'json' })
    payment: JSON;

    @Column({ type: 'json' })
    delivery: JSON;

    @Column({ type: 'text' })
    comments: string;

    @Column({ type: 'text', enum: STATUS })
    status: STATUS | string;

    @Column({ type: 'numeric' })
    total: number;

    @OneToMany(() => CartItemEntity, (item) => item.cart_id, { cascade: true })
    @JoinColumn({ name: 'id', referencedColumnName: 'cart_id'})
    items: CartItemEntity[];
}
