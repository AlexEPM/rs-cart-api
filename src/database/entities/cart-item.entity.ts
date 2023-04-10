import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CartEntity } from './cart.entity';

@Entity({ name: 'cart_items'})
export class CartItemEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', unique: false, nullable: false })
    @ManyToOne(
        () => CartEntity,
        (cart) => cart.id,
        {
            orphanedRowAction: 'delete',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
    cart_id: string;

    @Column({ type: 'uuid' })
    product_id: string;

    @Column({ type: 'int' })
    count: number;
}
