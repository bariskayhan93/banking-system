import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Person} from "./person.entity";

@Entity()
export class Friendship {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Person, { onDelete: 'CASCADE' })
    person: Person;

    @ManyToOne(() => Person, { onDelete: 'CASCADE' })
    friend: Person;
}