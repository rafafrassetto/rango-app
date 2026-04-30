export async function buscarCep(cep) {
  const numerico = String(cep || '').replace(/\D/g, '');
  if (numerico.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos.');
  }
  const response = await fetch(`https://viacep.com.br/ws/${numerico}/json/`);
  if (!response.ok) {
    throw new Error('Falha ao consultar o CEP.');
  }
  const data = await response.json();
  if (data.erro) {
    throw new Error('CEP não encontrado.');
  }
  return {
    cep: data.cep,
    rua: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
  };
}
