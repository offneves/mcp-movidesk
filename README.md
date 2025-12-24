# Movidesk Ticket Context MCP Server

O projeto propõe um servidor MCP [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) que permite que assistentes IA acessem detalhes técnicos de tickets do **Movidesk** diretamente no chat client.

Ele utiliza **Playwright** para navegar e extrair dados da interface web do Movidesk, formatando-os em Markdown otimizado para análise por LLMs.

## Funcionalidades

- **Autenticação Automática**: Gerencia login e sessão persistente (via `storageState.json`) para evitar logins repetitivos.
- **Busca de Tickets**: Busca por ID ou URL do ticket.
- **Validação de Login**: Ferramenta dedicada para testar credenciais e URL base.
- **Contexto Rico**: Retorna descrição, status, SLA, categoria, urgência, clientes e histórico completo de interações (incluindo imagens).
- **Seguro**: Credenciais gerenciadas via variáveis de ambiente.

## Pré-requisitos

- Node.js 20 ou superior.
- Docker (opcional, para execução via container).
- Acesso a uma conta Movidesk (Usuário e Senha).

## Instalação e Build

1. **Clone o repositório** (se aplicável) ou navegue até a pasta:
    ```bash
    cd /caminho/para/mcp-movidesk
    ```

2. **Instale as dependências**:
    ```bash
    npm install
    ```

3. **Compile o projeto**:
    ```bash
    npm run build
    ```
    Isso gerará os arquivos JavaScript na pasta `dist/`.

4. **Rodar o projeto via terminal**:
    ```bash
    npm run start
    ```

## Configuração no Windsurf / Cursor / Claude Desktop

Para usar este servidor em um cliente MCP, adicione a configuração ao seu arquivo de configuração (ex: `mcp_config.json`, `mcp.json`  ou `claude_desktop_config.json`).

**Importante:** Você deve fornecer suas credenciais do Movidesk via variáveis de ambiente.

### Execução Direta (Node.js)

```json
{
  "mcpServers": {
    "movidesk": {
      "command": "node",
      "args": ["/caminho/absoluto/para/mcp-movidesk/dist/index.js"],
      "env": {
        "MOVIDESK_BASE_URL": "https://sua-empresa.movidesk.com",
        "MOVIDESK_USERNAME": "seu-email@dominio.com",
        "MOVIDESK_PASSWORD": "sua-senha"
      }
    }
  }
}
```

> **Nota:** Certifique-se de usar o caminho absoluto para o arquivo `dist/index.js`.

### Execução via Docker (Recomendado para Isolamento)

Para isolar o ambiente e garantir que todas as dependências do Playwright estejam presentes sem sujar seu sistema host:

1. **Construir a imagem**:
    ```bash
    docker build -t mcp-movidesk .
    ```

2. **Configurar no cliente MCP**:
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
            "mcp-movidesk"
          ]
        }
      }
    }
    ```

3. **Testar o container manualmente**:
    ```bash
    docker run -i --rm mcp-movidesk
    ```

## Ferramentas (Tools)

### `get_movidesk_ticket_context`
Extrai o contexto completo de um ticket (Metadados, Descrição e Histórico).
- **Argumentos**: `ticketId` (string, opcional) ou `ticketUrl` (string, opcional).

### `validate_movidesk_login`
Valida se as credenciais e a URL base estão corretas sem realizar o scrap.
- **Argumentos**: `baseUrl`, `username`, `password` (opcionais, usa env vars como fallback).

## Desenvolvimento Local

Para testar localmente sem um cliente MCP, você pode rodar:

```bash
export MOVIDESK_BASE_URL="https://..."
export MOVIDESK_USERNAME="..."
export MOVIDESK_PASSWORD="..."

npm start
```

## Como a LLM usa?

Uma vez configurado, você pode pedir ao assistente:

> *"Verifique os detalhes do ticket 12345 no Movidesk e veja se tem relação com este código."*

O assistente chamará a tool `get_movidesk_ticket_context(ticketId: "12345")`, receberá o contexto rico (incluindo links de imagens) e poderá analisar o problema com muito mais precisão.

## Notas Técnicas

- **Seletores CSS**: O arquivo `src/movidesk/ticketScraper.ts` contém seletores baseados em estruturas comuns. É altamente provável que você precise ajustá-los inspecionando o DOM da sua instância específica do Movidesk (`#TicketTitle`, `#TicketStatus`, etc.), pois o Movidesk pode ter variações de layout.
- **Headless**: O navegador roda em modo headless (sem interface gráfica) por padrão para ser rápido.

## Licença

MIT
