# Ordem de Execução - Migração de Dados

## Problema Identificado

A tabela MySQL `cadastro` concentra múltiplas responsabilidades:
- Dados do negócio (empresa, telefone, email, etc.)
- Categoria (via campo `palavrachave`)
- Localização (via campos `cidade` e `estado`)

## Solução Implementada

Separação da migração em 3 etapas sequenciais:

### 1️⃣ Extração de Categorias (PRIMEIRO)
**Worker**: `CategoryExtractionWorker`  
**Comando**: `npm run migrate:data:extract-categories`

**O que faz**:
- Lê todos os valores únicos do campo `cadastro.palavrachave`
- Normaliza o formato (substitui `_` por espaços)
- Cria categorias na tabela PostgreSQL `categories` com:
  - Nome em PT/EN/ES
  - Ícone sugerido
  - Detalhes formatados
- **Exemplo**: `materiais_para_construções` → Categoria "Materiais Para Construções"

**Saída**:
```
📊 Found 45 unique keywords
✅ Created category: Restaurante
✅ Created category: Materiais Para Construções
✅ Created category: Hotel
...
```

---

### 2️⃣ Extração de Localizações (SEGUNDO)
**Worker**: `LocationExtractionWorker`  
**Comando**: `npm run migrate:data:extract-locations`

**O que faz**:
- Lê todas as combinações únicas de `cidade` + `estado`
- Lista todas as localizações encontradas
- **Nota**: Atualmente apenas lista. Você precisa:
  - Criar uma entidade `Location` no PostgreSQL
  - Descomentar o código de criação no worker

**Saída**:
```
📊 Found 23 unique locations
📍 Unique locations found:
   1. Vacaria - RS
   2. Muitos Capões - RS
   3. Bom Jesus - RS
   ...
```

**TODO**: Implementar entidade Location

---

### 3️⃣ Importação de Businesses (TERCEIRO)
**Worker**: `BusinessMigrationWorker`  
**Comando**: `npm run migrate:data:business`

**O que faz**:
- **PRÉ-REQUISITO**: Categorias já criadas no passo 1
- Carrega cache de categorias para lookups rápidos
- Para cada registro em `cadastro`:
  1. Busca o `category.aux_id` correspondente ao `palavrachave`
  2. Mapeia todos os campos (coordenadas do `mapa`, phones, etc.)
  3. Cria o business com referência correta à categoria
  4. Detecta duplicados
  5. Valida e sanitiza dados

**Mapeamento de Categoria**:
```typescript
cadastro.palavrachave = "materiais_para_construções"
  ↓ normaliza
"Materiais Para Construções"
  ↓ busca em categories
category.aux_id = 7
  ↓ atribui
business.categoryId = 7
```

---

## Comandos Disponíveis

### Migração Completa (Recomendado)
```bash
npm run migrate:data
```
Executa na ordem correta:
1. `extract-categories`
2. `extract-locations`  
3. `business`

### Migrações Individuais
```bash
# Apenas categorias
npm run migrate:data:extract-categories

# Apenas localizações
npm run migrate:data:extract-locations

# Apenas businesses (requer categorias já criadas)
npm run migrate:data:business
```

### Modo Dry Run (Teste sem gravar)
```bash
DRY_RUN=true npm run migrate:data
DRY_RUN=true npm run migrate:data:extract-categories
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│              MySQL: cadastro (Legacy)                    │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │ palavrachave │ cidade/estado│  empresa + outros    │ │
│  └──────┬───────┴──────┬───────┴──────────┬───────────┘ │
└─────────┼──────────────┼──────────────────┼─────────────┘
          │              │                  │
          ▼              ▼                  ▼
    [Extract]       [Extract]          [Import]
          │              │                  │
          ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL (Modern Schema)                    │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │ categories   │  locations   │   businesses         │ │
│  │ (aux_id)     │  (id)        │   (refs categories)  │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Benefícios da Abordagem

✅ **Normalização de Dados**: Categorias e localizações únicas  
✅ **Referencial Integrity**: Businesses referenciam categorias existentes  
✅ **Reutilização**: Múltiplos businesses podem compartilhar mesma categoria  
✅ **Manutenibilidade**: Atualizar categoria afeta todos os businesses  
✅ **Performance**: Cache de categorias acelera importação  
✅ **Flexibilidade**: Tradução de categorias para PT/EN/ES  

---

## Próximos Passos

### 1. Criar Entidade Location (se necessário)
```typescript
// src/app/infra/repositories/type-orm/models/location.entity.ts
@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;
}
```

### 2. Atualizar LocationExtractionWorker
Descomentar código de criação de locations

### 3. Atualizar BusinessMigrationWorker
Adicionar lookup de `locationId` baseado em `cidade` + `estado`

### 4. Revisar Mapeamento de Categorias
Ajustar `categoryMap` no `BusinessMigrationMapper` conforme necessário

---

## Troubleshooting

### "Category not found for palavrachave"
- Rode `extract-categories` primeiro
- Verifique se a normalização está correta
- Adicione log para ver quais keywords não foram mapeados

### Businesses sem categoria
- São criados com `DEFAULT_CATEGORY_ID = 1`
- Revise logs para identificar palavrachaves não mapeados
- Adicione mappings no worker de extração

### Performance lenta
- Batch size pode ser ajustado (`BATCH_SIZE = 100`)
- Cache de categorias reduz queries ao banco
- Use índices no PostgreSQL em `categories.name`

---

## Logs de Exemplo

```bash
$ npm run migrate:data

═══════════════════════════════════════════════════════════
🔄 Circuito BR-116 - Data Migration Tool
   MySQL → PostgreSQL
═══════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────
🚀 Starting: Category Extraction from palavrachave
───────────────────────────────────────────────────────────
📊 Found 45 unique keywords
✅ Created category: Restaurante
✅ Created category: Materiais Para Construções
...
✅ Category extraction completed: 45 imported, 0 skipped

───────────────────────────────────────────────────────────
🚀 Starting: Location Extraction from cidade/estado
───────────────────────────────────────────────────────────
📊 Found 23 unique locations
📍 Unique locations found:
   1. Vacaria - RS
   2. Muitos Capões - RS
...
✅ Location extraction completed: 23 would be imported

───────────────────────────────────────────────────────────
🚀 Starting: Business Migration from cadastro
───────────────────────────────────────────────────────────
⚠️  Make sure you ran CategoryExtractionWorker first!
📦 Loading category cache...
✅ Loaded 45 categories into cache
📊 Found 1,523 businesses to migrate
📦 Processing batch 1/16 (100 items)
✅ Imported: Madeireira São José (categoria: 7)
✅ Imported: Restaurante do João (categoria: 1)
...
📈 Progress: 1523/1523 (100.0%)

═══════════════════════════════════════════════════════════
📊 MIGRATION SUMMARY
═══════════════════════════════════════════════════════════
   Total Imported: 1,591
   Total Skipped:  0
   Total Failed:   0
   Total Duration: 52.34s
═══════════════════════════════════════════════════════════
✅ Migration completed successfully!
```
