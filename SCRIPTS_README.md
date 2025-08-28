# 📋 Scripts do Projeto EletroON Frontend

## 🚀 Comandos Disponíveis

### 🔧 **Desenvolvimento**
```bash
npm run dev
```
- **Porta**: 3001
- **Descrição**: Inicia o servidor de desenvolvimento com hot reload
- **Uso**: Para desenvolvimento local e testes

### 🏗️ **Build**
```bash
npm run build
```
- **Descrição**: Constrói a aplicação para produção
- **Saída**: Pasta `.next` com arquivos otimizados
- **Uso**: Antes de fazer deploy ou executar em produção

### 🚀 **Produção (Modo Padrão)**
```bash
npm run start
```
- **Porta**: 3001
- **Descrição**: Inicia o servidor de produção padrão do Next.js
- **Uso**: Para produção sem configuração standalone

### 🚀 **Produção (Modo Standalone)**
```bash
npm run start:standalone
```
- **Descrição**: Inicia o servidor standalone (recomendado para produção)
- **Uso**: Para produção com configuração standalone
- **Requisito**: Deve executar `npm run build` primeiro

### 🚀 **Build + Produção Standalone**
```bash
npm run start:prod
```
- **Descrição**: Executa build e inicia produção standalone automaticamente
- **Uso**: Para produção completa em um comando

## ⚠️ **Aviso Importante**

Este projeto está configurado com `output: 'standalone'` no `next.config.ts`, o que significa:

- **✅ Recomendado**: Use `npm run start:standalone` para produção
- **⚠️ Não recomendado**: `npm run start` pode não funcionar corretamente
- **🔧 Desenvolvimento**: `npm run dev` funciona normalmente

## 🎯 **Quando Usar Cada Comando**

### 🏠 **Desenvolvimento Local**
```bash
npm run dev
```

### 🚀 **Deploy em Produção**
```bash
# Opção 1: Build + Standalone (recomendado)
npm run start:prod

# Opção 2: Comandos separados
npm run build
npm run start:standalone
```

### 🧪 **Teste de Build**
```bash
npm run build
```

## 📁 **Estrutura de Arquivos Após Build**

Após executar `npm run build`, você terá:

```
.next/
├── standalone/          # Servidor standalone
│   ├── server.js       # Servidor principal
│   └── ...            # Outros arquivos
├── static/             # Arquivos estáticos
└── ...                 # Outros arquivos do build
```

## 🔧 **Configuração Standalone**

A configuração `output: 'standalone'` oferece:

- **🚀 Performance**: Servidor otimizado para produção
- **📦 Portabilidade**: Aplicação autocontida
- **🔒 Segurança**: Menos dependências expostas
- **📊 Monitoramento**: Melhor observabilidade

## 🚨 **Solução de Problemas**

### **Erro: "next start" does not work with "output: standalone"**

**Solução**: Use `npm run start:standalone` em vez de `npm run start`

### **Erro: "Cannot find module '.next/standalone/server.js'"**

**Solução**: Execute `npm run build` primeiro para gerar os arquivos

### **Porta já em uso**

**Solução**: Mude a porta no script ou pare outros processos na porta 3001

## 📝 **Exemplos de Uso**

### **Desenvolvimento**
```bash
cd eletroon-frontend
npm install
npm run dev
# Acesse: http://localhost:3001
```

### **Produção**
```bash
cd eletroon-frontend
npm install
npm run start:prod
# Acesse: http://localhost:3001
```

### **Docker/Container**
```bash
# Build
npm run build

# Executar standalone
npm run start:standalone
```

---

**💡 Dica**: Para produção, sempre use `npm run start:standalone` ou `npm run start:prod`!
