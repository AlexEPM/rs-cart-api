import {Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {CartItemEntity} from "./cart-item.entity";

export enum STATUS {
    OPEN = 'OPEN',
    ORDERED = 'ORDERED'
}

@Entity({ name: 'carts'})
export class CartEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', unique: true, nullable: false })
    user_id: string;

    @Column({ type: 'date', nullable: false })
    created_at: Date;

    @Column({ type: 'date', nullable: false })
    updated_at: Date;

    @Column({ type: 'text', enum: STATUS })
    status: STATUS;

    @OneToMany(() => CartItemEntity, (item) => item.cart_id, { cascade: true })
    @JoinColumn({ name: 'id', referencedColumnName: 'cart_id'})
    items: CartItemEntity[];
}
