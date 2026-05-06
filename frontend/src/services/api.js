// servico pra fazer chamada http autenticada, nada chique

/** Mesmo host da página + porta do backend; em outro dispositivo na rede usa o IP certo. Build: VUE_APP_API_BASE_URL */
export function getApiBaseUrl() {
  const fromEnv = process.env.VUE_APP_API_BASE_URL
  if (fromEnv) {
    return String(fromEnv).replace(/\/+$/, '')
  }
  if (typeof window === 'undefined' || !window.location) {
    return 'http://localhost:3009/api'
  }
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:3009/api`
}

// funcao pra pegar o token do localStorage (se nao tiver ja era)
function getAuthToken() {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.token;
  } catch (e) {
    return null;
  }
}

// funcao que faz request autenticado, eu centralizei pra nao repetir em todo lugar
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// metodos pros pedidos
export const pedidosAPI = {
  // pegar todos os pedidos (filtra pelo tipo do user la no backend)
  getAll: () => apiRequest('/pedidos'),

  // contagens por status (cliente ou fornecedor) — opcional; o gráfico usa os pedidos do getAll
  getResumoStatus: () => apiRequest('/pedidos/resumo-status'),
  /** @deprecated use getResumoStatus — mesmo endpoint */
  getResumoStatusFornecedor: () => apiRequest('/pedidos/resumo-status'),
  
  // pegar pedido por id
  getById: (id) => apiRequest(`/pedidos/${id}`),
  
  // cria pedido novo
  create: (pedidoData) => apiRequest('/pedidos', {
    method: 'POST',
    body: JSON.stringify(pedidoData)
  }),
  
  // atualiza pedido
  update: (id, pedidoData) => apiRequest(`/pedidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pedidoData)
  }),
  
  // deleta pedido
  delete: (id) => apiRequest(`/pedidos/${id}`, {
    method: 'DELETE'
  })
};

// metodos pros fornecedores
export const fornecedoresAPI = {
  // lista os fornecedores
  getAll: () => apiRequest('/auth/fornecedores')
};

// metodos pros produtos
export const produtosAPI = {
  getAll: () => apiRequest('/produtos'),
  search: (termo) => apiRequest(`/produtos/search?termo=${encodeURIComponent(termo)}`),
  getById: (id) => apiRequest(`/produtos/${id}`),
  create: (data) => apiRequest('/produtos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/produtos/${id}`, { method: 'DELETE' })
};

export default {
  pedidosAPI,
  fornecedoresAPI,
  produtosAPI
};

