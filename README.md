# Movidesk Ticket Context MCP Server 🎫

Este é um servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) que permite que assistentes de IA (como Cascade/Windsurf) acessem detalhes técnicos de tickets do **Movidesk** diretamente no chat.

Ele utiliza **Playwright** para navegar e extrair dados da interface web do Movidesk, formatando-os em Markdown otimizado para análise por LLMs.

## ✨ Funcionalidades

- **Autenticação Automática**: Gerencia login e sessão persistente (via `storageState.json`) para evitar logins repetitivos.
- **Busca de Tickets**: Busca por ID ou URL do ticket.
- **Contexto Rico**: Retorna descrição, status, SLA, cliente e histórico completo de interações.
- **Seguro**: Credenciais gerenciadas via variáveis de ambiente.

## 🛠️ Pré-requisitos

- Node.js 18 ou superior.
- Acesso a uma conta Movidesk (Usuário e Senha).

## 🚀 Instalação e Build

1.  **Clone o repositório** (se aplicável) ou navegue até a pasta:
    ```bash
    cd /caminho/para/mcp-movidesk
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```
    Isso também instalará os navegadores do Playwright necessários.

3.  **Compile o projeto**:
    ```bash
    npm run build
    ```
    Isso gerará os arquivos JavaScript na pasta `dist/`.

## ⚙️ Configuração no Cascade / Windsurf

Para usar este servidor no Windsurf ou qualquer cliente MCP, adicione a configuração ao seu arquivo `mcp_config.json`.

**Importante:** Você deve fornecer suas credenciais do Movidesk via variáveis de ambiente.

```json
{
  "mcpServers": {
    "movidesk": {
      "command": "node",
      "args": ["/caminho/absoluto/para/mcp-movidesk/dist/index.js"],
      "env": {
        "MOVIDESK_BASE_URL": "https://sua-empresa.movidesk.com",
        "MOVIDESK_USERNAME": "seu-email@dominio.com",
        "MOVIDESK_PASSWORD": "sua-senha-secreta"
      }
    }
  }
}
```

> 💡 **Nota:** Certifique-se de usar o caminho absoluto para o arquivo `dist/index.js`.

## 🐳 Executando com Docker

Para isolar o ambiente e evitar problemas de dependências do sistema, você pode usar Docker.

1.  **Construir a imagem**:
    ```bash
    docker build -t movidesk-mcp .
    ```

2.  **Configurar no `mcp_config.json`** para usar Docker:
    ```json
    {
      "mcpServers": {
        "movidesk": {
          "command": "docker",
          "args": [
            "run",
            "-i",
            "--rm",
            "-e", "MOVIDESK_BASE_URL=https://sua-empresa.movidesk.com",
            "-e", "MOVIDESK_USERNAME=seu-email@dominio.com",
            "-e", "MOVIDESK_PASSWORD=sua-senha",
            "movidesk-mcp"
          ]
        }
      }
    }
    ```

## 🖥️ Desenvolvimento Local

Para testar localmente sem o Cascade, você pode rodar o servidor e verificar se ele inicia sem erros:

```bash
# Defina as variáveis primeiro
export MOVIDESK_BASE_URL="https://..."
export MOVIDESK_USERNAME="..."
export MOVIDESK_PASSWORD="..."

# Rode o servidor
node dist/index.js
```
O servidor ficará aguardando comandos via STDIN (é o comportamento esperado do protocolo MCP).

## 📝 Como a LLM usa?

Uma vez configurado, você pode pedir ao Cascade:

> *"Verifique os detalhes do ticket 12345 no Movidesk e veja se tem relação com este código."*

O Cascade chamará a tool `get_movidesk_ticket_context(ticketId: "12345")` e receberá um resumo detalhado como contexto.

## ⚠️ Notas Técnicas

- **Seletores CSS**: O arquivo `src/movidesk/ticketScraper.ts` contém seletores baseados em estruturas comuns. É altamente provável que você precise ajustá-los inspecionando o DOM da sua instância específica do Movidesk (`#TicketTitle`, `#TicketStatus`, etc.), pois o Movidesk pode ter variações de layout.
- **Headless**: O navegador roda em modo headless (sem interface gráfica) por padrão para ser rápido e silencioso.

## 📄 Licença

ISC
