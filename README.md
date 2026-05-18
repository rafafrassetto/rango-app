# Rango App

App mobile de delivery de comida **por kg**, com painel para restaurantes e cliente final. Foco em restaurantes de Criciúma/SC.

Projeto da disciplina **Soluções Mobile — Engenharia de Software (SATC)** · ABP Final.

## Stack

- **Frontend mobile**: React Native + Expo (SDK 54)
- **Backend**: Node.js + Express + Sequelize
- **Banco de dados**: PostgreSQL (Supabase)
- **Realtime / Storage**: Supabase
- **Persistência local**: AsyncStorage (cache offline)

## Funcionalidades

### Cliente
- Cadastro, login e recuperação de senha
- Catálogo de restaurantes (busca real da API)
- Cardápio por restaurante com ajuste de peso (gramas)
- Carrinho, finalização de pedido e acompanhamento de status
- Endereços múltiplos (CRUD)
- Mapa de localização (`expo-location` + `react-native-maps`)
- Geração de recibo do pedido em PDF (`expo-print`)
- **Clima atual de Criciúma** na Home (API wttr.in)
- **Shake pra atualizar** a lista de restaurantes (`expo-sensors`)

### Restaurante
- Login dedicado (`/restaurants/login`)
- Painel com KPIs (pedidos do dia, faturamento, total de pratos)
- Gerenciamento do cardápio (CRUD de pratos)
- Gerenciamento de pedidos (avançar status, cancelar)
- Cada restaurante vê apenas os próprios dados

## Requisitos do ABP

### Obrigatórios
| Item | Status |
|---|---|
| Mínimo 4 telas | ✅ ~20 telas |
| Nome e ícone personalizados | ✅ "Rango App" + `icon.png` |
| Persistência | ✅ Supabase + AsyncStorage |
| Mínimo 2 CRUDs | ✅ Pratos, endereços, pedidos, usuários, restaurantes |
| React Native + Expo | ✅ |

### Opcionais implementados (+1,5)
- ✅ Geolocalização e mapas
- ✅ API online própria (Express + Supabase)
- ✅ API externa (clima de Criciúma via wttr.in)
- ✅ Geração de PDF (recibo do pedido)
- ✅ Acelerômetro (shake pra recarregar)

## Como rodar

### 1. Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (free tier)
- Expo Go instalado no celular

### 2. Configurar variáveis de ambiente
Copie `.env.example` para `.env` e preencha:

```env
DATABASE_URL=postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
PORT=3000
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

### 3. Instalar dependências
```bash
npm install
```

### 4. Criar o banco
```bash
npm run db:migrate
npm run db:seed
```

### 5. Subir o backend
```bash
npm run server
```

### 6. Subir o app
```bash
npm start
```
Escaneie o QR Code com o Expo Go.

## Contas de teste (pós-seed)

### Cliente
- Email: `rafafrass@gmail.com`
- Senha: `teste123`

### Restaurante
- Email: `contato@sabordaserra.com.br` (ou qualquer um do seed)
- Senha: `restaurante123`

## Estrutura do banco

```
restaurants ─┬─ dishes ──┐
             │           │
users ──┬────┼────────── order_items
        │    │           │
        ├─ addresses     │
        │                │
        └─ orders ───────┘
```

## Deploy do backend (Render)

O arquivo `render.yaml` já está pronto. No painel do Render:
1. New → Blueprint → conecte o repo
2. Configure `DATABASE_URL` como secret
3. O endpoint público vai ficar em `https://rango-api.onrender.com`
4. Atualize `EXPO_PUBLIC_API_URL` no `.env` do app pra esse endpoint
