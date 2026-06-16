
export const menus = [
  { label: 'Início', path: '/cliente', roles: ['cliente'] },
  { label: 'Início', path: '/fornecedor', roles: ['fornecedor'] },
  { label: 'Início', path: '/admin', roles: ['admin'] },
  { label: 'Pedidos', path: '/pedidos', roles: ['cliente', 'admin'] },
  { label: 'Produtos', path: '/produtos', roles: ['admin'] },
  { label: 'Usuários', path: '/usuarios', roles: ['admin'] },
]
