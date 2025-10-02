# Diagrama de Classes - Banco de Dados AgendaLog

## Estrutura Atual (Implementada)

```mermaid
erDiagram
    Users {
        int id PK "AUTO_INCREMENT"
        string email UK "NOT NULL, UNIQUE"
        string senha "NOT NULL"
        string tipo "NOT NULL (admin, cliente, fornecedor)"
    }
```

## Estrutura Expandida  (que sera feita)

```mermaid
erDiagram
    Users {
        int id PK "AUTO_INCREMENT"
        string email UK "NOT NULL, UNIQUE"
        string senha "NOT NULL"
        string tipo "NOT NULL"
        string nome "NOT NULL"
        string telefone
        datetime createdAt
        datetime updatedAt
    }
    
    Agendamentos {
        int id PK "AUTO_INCREMENT"
        int userId FK "NOT NULL"
        string titulo "NOT NULL"
        string descricao
        datetime dataHora "NOT NULL"
        string status "NOT NULL"
        string localizacao
        datetime createdAt
        datetime updatedAt
    }
    
    Pedidos {
        int id PK "AUTO_INCREMENT"
        int clienteId FK "NOT NULL"
        int fornecedorId FK "NOT NULL"
        string numeroPedido UK "NOT NULL, UNIQUE"
        string descricao
        decimal valor "NOT NULL"
        string status "NOT NULL"
        datetime dataPedido "NOT NULL"
        datetime dataEntrega
        datetime createdAt
        datetime updatedAt
    }
    
    Produtos {
        int id PK "AUTO_INCREMENT"
        string nome "NOT NULL"
        string descricao
        decimal preco "NOT NULL"
        int estoque "NOT NULL"
        string categoria
        datetime createdAt
        datetime updatedAt
    }
    
    ItemPedido {
        int id PK "AUTO_INCREMENT"
        int pedidoId FK "NOT NULL"
        int produtoId FK "NOT NULL"
        int quantidade "NOT NULL"
        decimal precoUnitario "NOT NULL"
        decimal subtotal "NOT NULL"
        datetime createdAt
    }
    
    Logs {
        int id PK "AUTO_INCREMENT"
        string nivel "NOT NULL"
        string mensagem "NOT NULL"
        string origem
        json metadata
        datetime timestamp "NOT NULL"
    }
    
    Users ||--o{ Agendamentos : "possui"
    Users ||--o{ Pedidos : "cliente faz"
    Users ||--o{ Pedidos : "fornecedor atende"
    Pedidos ||--o{ ItemPedido : "contém"
    Produtos ||--o{ ItemPedido : "incluído em"
```

## Legenda dos Tipos de Usuário

- **admin**: Acesso completo ao sistema
- **cliente**: Pode fazer pedidos e agendamentos
- **fornecedor**: Pode atender pedidos e agendamentos

## Status dos Agendamentos

- **agendado**: Agendamento criado, aguardando confirmação
- **confirmado**: Agendamento confirmado pelo fornecedor
- **cancelado**: Agendamento cancelado
- **concluído**: Agendamento finalizado

## Status dos Pedidos

- **pendente**: Pedido criado, aguardando aprovação
- **aprovado**: Pedido aprovado pelo fornecedor
- **em_producao**: Pedido em produção
- **enviado**: Pedido enviado para entrega
- **entregue**: Pedido entregue ao cliente
- **cancelado**: Pedido cancelado

## Níveis de Log

- **ERROR**: Erros críticos
- **WARN**: Avisos importantes
- **INFO**: Informações gerais
- **DEBUG**: Informações detalhadas para debugging
