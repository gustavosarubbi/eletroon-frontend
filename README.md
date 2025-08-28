# EletroON Frontend - Sistema Moderno de Monitoramento de Energia

## 🚀 Visão Geral

O EletroON é um sistema inteligente de monitoramento e gestão de energia que oferece uma interface moderna, elegante e responsiva para acompanhar o consumo de energia em tempo real.

## ✨ Principais Melhorias Implementadas

### 🎨 Design System Moderno
- **Sistema de Cores Premium**: Paleta de cores otimizada para alto contraste e acessibilidade
- **Gradientes Elegantes**: Gradientes modernos e sofisticados em toda a interface
- **Tipografia Aprimorada**: Sistema de fontes hierárquico e legível
- **Sombras e Bordas**: Sistema de sombras e bordas consistente e moderno

### 🎭 Animações e Transições
- **Framer Motion**: Animações fluidas e responsivas em toda a aplicação
- **Micro-interações**: Hover effects, transições suaves e feedback visual
- **Loading States**: Estados de carregamento elegantes e informativos
- **Page Transitions**: Transições suaves entre páginas

### 📱 Interface Responsiva
- **Mobile-First**: Design otimizado para dispositivos móveis
- **Sidebar Responsiva**: Navegação lateral que se adapta a diferentes tamanhos de tela
- **Grid System**: Sistema de grid flexível e responsivo
- **Touch-Friendly**: Elementos otimizados para interação touch

### 🔧 Componentes Aprimorados
- **Cards Modernos**: Cards com design glassmorphism e efeitos de hover
- **Botões Inteligentes**: Botões com estados visuais claros e feedback
- **Formulários Elegantes**: Campos de entrada com validação em tempo real
- **Tabelas Interativas**: Tabelas com hover effects e animações

### 📊 Dashboards Inteligentes
- **Gráficos Interativos**: Gráficos Recharts com design moderno
- **Métricas em Tempo Real**: Cards de métricas com atualizações automáticas
- **Filtros Avançados**: Sistema de filtros para análise de dados
- **Relatórios Visuais**: Relatórios com visualizações gráficas

### 🎯 Experiência do Usuário
- **Validação em Tempo Real**: Feedback imediato para entradas do usuário
- **Estados de Loading**: Indicadores visuais claros para operações assíncronas
- **Mensagens de Erro**: Tratamento elegante de erros e validações
- **Navegação Intuitiva**: Fluxo de navegação lógico e intuitivo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com App Router
- **React 19**: Biblioteca de interface do usuário
- **TypeScript**: Tipagem estática para JavaScript
- **Tailwind CSS 4**: Framework CSS utilitário
- **Framer Motion**: Biblioteca de animações

### UI Components
- **Radix UI**: Componentes acessíveis e customizáveis
- **Lucide React**: Ícones modernos e consistentes
- **Recharts**: Biblioteca de gráficos React

### State Management
- **React Query**: Gerenciamento de estado do servidor
- **React Context**: Gerenciamento de estado global
- **React Hook Form**: Formulários com validação

### Styling
- **CSS Modules**: Estilos modulares e organizados
- **CSS Variables**: Sistema de variáveis CSS customizáveis
- **Responsive Design**: Design adaptativo para todos os dispositivos

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>

# Entre no diretório
cd eletroon-frontend

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

### Scripts Disponíveis
```bash
npm run dev              # Executa em modo de desenvolvimento (porta 3001)
npm run build            # Constrói para produção
npm run start            # Executa em modo de produção padrão
npm run start:standalone # Executa em modo standalone (recomendado para produção)
npm run start:prod       # Build + produção standalone em um comando
npm run lint             # Executa o linter
```

**⚠️ Importante**: Este projeto usa configuração `standalone`. Para produção, use `npm run start:standalone` ou `npm run start:prod`.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (app)/             # Rotas autenticadas
│   │   ├── dashboard/     # Dashboard do usuário
│   │   └── admin/         # Dashboard administrativo
│   ├── login/             # Página de login
│   ├── globals.css        # Estilos globais
│   └── layout.tsx         # Layout raiz
├── components/             # Componentes reutilizáveis
│   ├── ui/                # Componentes base da UI
│   └── layout/            # Componentes de layout
├── contexts/               # Contextos React
├── lib/                    # Utilitários e configurações
└── types/                  # Definições de tipos TypeScript
```

## 🎨 Sistema de Design

### Cores Principais
- **Primary**: Azul (#1e40af) - Ações principais e links
- **Accent**: Verde (#059669) - Sucesso e confirmação
- **Warning**: Laranja (#d97706) - Avisos e alertas
- **Danger**: Vermelho (#dc2626) - Erros e ações destrutivas

### Gradientes
- **Primary Gradient**: Azul para azul escuro
- **Accent Gradient**: Verde para verde escuro
- **Glass Effect**: Transparência com blur para cards

### Tipografia
- **Font Family**: Inter (sans-serif)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Heights**: Otimizadas para legibilidade

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptações
- Sidebar colapsável em dispositivos móveis
- Grid responsivo que se adapta ao tamanho da tela
- Navegação otimizada para touch
- Elementos redimensionáveis

## 🔒 Autenticação

### Sistema de Login
- Validação em tempo real de email e senha
- Feedback visual para campos inválidos
- Estados de loading durante autenticação
- Redirecionamento automático baseado no papel do usuário

### Controle de Acesso
- **Usuários**: Acesso ao dashboard pessoal
- **Administradores**: Acesso completo ao sistema

## 📊 Funcionalidades

### Dashboard do Usuário
- Monitoramento em tempo real de consumo
- Gráficos interativos de potência e tensão
- Relatórios de consumo por período
- Filtros de tempo personalizáveis

### Dashboard Administrativo
- Visão geral de todos os medidores
- Gerenciamento de usuários e salas
- Estatísticas do sistema
- Controles de administração

## 🎯 Melhorias de Performance

### Otimizações
- Lazy loading de componentes
- Debouncing em inputs de busca
- Cache inteligente com React Query
- Otimizações de bundle com Next.js

### Acessibilidade
- Contraste alto para melhor legibilidade
- Navegação por teclado
- Screen reader friendly
- Estados de foco visíveis

## 🔮 Próximas Melhorias

### Planejadas
- **Tema Escuro**: Suporte completo a tema escuro
- **Notificações Push**: Sistema de notificações em tempo real
- **Exportação de Dados**: Relatórios em PDF e Excel
- **Mobile App**: Aplicativo nativo para iOS e Android

### Em Desenvolvimento
- **Dashboard Analytics**: Métricas avançadas e insights
- **Integração IoT**: Conectividade com dispositivos IoT
- **Machine Learning**: Predições de consumo e otimizações

## 🤝 Contribuição

### Padrões de Código
- TypeScript strict mode
- ESLint com configuração Next.js
- Prettier para formatação
- Conventional Commits

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação de código
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento
- Consulte a documentação da API

---

**EletroON** - Transformando o monitoramento de energia com tecnologia moderna e design elegante. ⚡
