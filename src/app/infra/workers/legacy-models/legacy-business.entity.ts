import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Legacy Business Entity from MySQL Database
 * Maps to the 'cadastro' table structure
 */
@Entity('cadastro')
export class LegacyBusiness {
  @PrimaryGeneratedColumn({ name: 'codcadastro' })
  codcadastro: number;

  @Column({ nullable: true, length: 50 })
  empresa: string;

  @Column({ nullable: true, length: 30 })
  contato: string;

  @Column({ nullable: true, length: 30 })
  cargo: string;

  @Column({ nullable: true, type: 'text' })
  obsinternas: string;

  @Column({ nullable: true, length: 255 })
  endereco: string;

  @Column({ nullable: true, length: 50 })
  bairro: string;

  @Column({ nullable: true, length: 50 })
  cidade: string;

  @Column({ nullable: true, length: 2 })
  estado: string;

  @Column({ nullable: true, length: 9 })
  cep: string;

  @Column({ nullable: true, length: 30 })
  telefone: string;

  @Column({ nullable: true, length: 30 })
  fax: string;

  @Column({ nullable: true, length: 30 })
  celular: string;

  @Column({ nullable: true, length: 30 })
  whats1: string;

  @Column({ nullable: true, length: 30 })
  whats2: string;

  @Column({ name: 'exibir_contato', nullable: true, default: 1 })
  exibirContato: number;

  @Column({ nullable: true, type: 'text' })
  informacoes: string;

  @Column({ nullable: true, length: 150 })
  site: string;

  @Column({ nullable: true, length: 50 })
  email: string;

  @Column({ nullable: true })
  dataatualizada: Date;

  @Column({ nullable: true })
  datacontribui: Date;

  @Column({ nullable: true, length: 1, default: 'f' })
  nivel: string;

  @Column({ nullable: true, length: 35 })
  foto: string;

  @Column({ nullable: true, length: 250 })
  palavrachave: string;

  @Column({ nullable: true, default: 2 })
  visitas: number;

  @Column({ nullable: true, type: 'text' })
  mapa: string;

  @Column({ nullable: true })
  contatomarcado: Date;

  @Column({ nullable: true, length: 1, default: 'n' })
  pendente: string;

  @Column({ nullable: true, length: 1, default: 'n' })
  pago: string;

  @Column({ nullable: true, length: 16, name: 'IP' })
  ip: string;

  @Column({ nullable: true, type: 'longtext' })
  palavras: string;

  @Column({ nullable: true })
  datacadastro: Date;

  @Column({ nullable: true })
  datadeelevacao: Date;

  @Column({ nullable: true, length: 30 })
  ponto: string;

  @Column({ nullable: true })
  datavisualiza: Date;

  @Column({ nullable: true, length: 1 })
  clube: string;

  @Column({ nullable: true })
  datainicialpromo: Date;

  @Column({ nullable: true })
  datafinalpromo: Date;

  @Column({ nullable: true, type: 'mediumtext' })
  descricaopromo: string;

  @Column({ nullable: true, length: 1 })
  exibirpromo: string;

  @Column({ name: 'home_print', nullable: true, default: 0 })
  homePrint: number;

  @Column({ nullable: true, length: 100 })
  facebook: string;

  @Column({ nullable: true, type: 'text' })
  imagens: string;

  @Column({ name: 'evento_data_inicio', nullable: true })
  eventoDataInicio: Date;

  @Column({ name: 'evento_data_fim', nullable: true })
  eventoDataFim: Date;

  @Column({ name: 'evento_empresa', nullable: true, length: 150 })
  eventoEmpresa: string;

  @Column({ name: 'evento_artista', nullable: true, length: 150 })
  eventoArtista: string;

  @Column({ name: 'evento_preco', nullable: true, length: 60 })
  eventoPreco: string;

  @Column({ nullable: true, length: 25 })
  youtube: string;

  @Column({ name: 'html_gerado', nullable: true, default: 0 })
  htmlGerado: number;

  @Column({ name: 'ia_gerado', nullable: true, default: 0 })
  iaGerado: number;
}
