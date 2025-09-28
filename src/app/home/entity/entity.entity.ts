import { Entity as EntityOrm, PrimaryGeneratedColumn, Column } from "typeorm";

@EntityOrm({ name: "cadastro" })
export class Entity {
  @PrimaryGeneratedColumn({ name: "codcadastro" })
  id: number;

  @Column({ name: "empresa" })
  companyName: string;

  @Column({ name: "telefone", nullable: true })
  phoneNumber?: string;

  @Column({ name: "email", nullable: true })
  email?: string;

  @Column({ name: "endereco", nullable: true })
  address?: string;

  @Column({ name: "foto", nullable: true })
  logoUrl?: string;

  @Column({ nullable: true, name: "nivel" })
  level?: string;
}
