process.env.USAR_BANCO_MEMORIA = 'true';
process.env.JWT_SECRET = 'segredo-de-teste-do-lembr-ai';

const test = require('node:test');
const assert = require('node:assert/strict');
const { RepositorioMemoria } = require('../src/repositorios/repositorio-dados');
const { criarControladorAutenticacao } = require('../src/controladores/autenticacao-controlador');

function criarResposta() {
  return {
    statusCode: 200,
    body: null,
    status(codigo) { this.statusCode = codigo; return this; },
    json(dados) { this.body = dados; return this; }
  };
}

function criarCenario() {
  const repositorio = new RepositorioMemoria();
  return { repositorio, controlador: criarControladorAutenticacao(repositorio) };
}

test('exige WhatsApp no cadastro e no login', async () => {
  const { controlador } = criarCenario();

  await assert.rejects(
    () => controlador.cadastrar({ body: { nome: 'Cristian', email: 'cristian@example.com', senha: 'senha-segura' } }, criarResposta()),
    (erro) => erro.statusCode === 400
  );
  await assert.rejects(
    () => controlador.entrar({ body: { email: 'cristian@example.com', senha: 'senha-segura' } }, criarResposta()),
    (erro) => erro.statusCode === 400
  );
});

test('normaliza o WhatsApp no cadastro e valida o mesmo número no login', async () => {
  const { controlador } = criarCenario();
  const cadastro = criarResposta();
  await controlador.cadastrar({ body: { nome: 'Cristian', email: 'CRISTIAN@example.com', telefone: '+55 (11) 99999-9999', senha: 'senha-segura' } }, cadastro);

  assert.equal(cadastro.statusCode, 201);
  assert.equal(cadastro.body.usuario.telefone, '5511999999999');

  const login = criarResposta();
  await controlador.entrar({ body: { email: 'cristian@example.com', telefone: '5511999999999', senha: 'senha-segura' } }, login);
  assert.equal(login.statusCode, 200);

  const telefoneDiferente = criarResposta();
  await controlador.entrar({ body: { email: 'cristian@example.com', telefone: '5511988887777', senha: 'senha-segura' } }, telefoneDiferente);
  assert.equal(telefoneDiferente.statusCode, 401);
});

test('impede cadastro com WhatsApp já utilizado', async () => {
  const { controlador } = criarCenario();
  await controlador.cadastrar({ body: { nome: 'Cristian', email: 'cristian@example.com', telefone: '5511999999999', senha: 'senha-segura' } }, criarResposta());

  const duplicado = criarResposta();
  await controlador.cadastrar({ body: { nome: 'Outra pessoa', email: 'outra@example.com', telefone: '+55 (11) 99999-9999', senha: 'senha-segura' } }, duplicado);
  assert.equal(duplicado.statusCode, 409);
  assert.equal(duplicado.body.erro, 'WhatsApp já cadastrado');
});
