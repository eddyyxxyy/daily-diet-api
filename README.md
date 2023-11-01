# daily-diet-api

API da aplicação Daily Diet, que será o responsável pelas anotações e lembretes dos cuidados que tomamos com nossas refeições livres e da dieta.

> Esse projeto é um dos desafios da trilha de Node do Ignite. Ou seja, é fornecido somente um guia de estilos para o visual da aplicação e seu conceito. Todo o código, estrutura de pastas, dependências e técnicas de programação usadas são advindas de quem programa, de mim no caso.

## Detalhes de desenvolvimento

No desafio previsto, muitas das tecnologias e metodologias ensinadas estão com um caráter simplista e mais focado no aprendizado das estruturas fundamentais da criação de APIs com Node e TypeScript.

Dessa forma, preferi me jogar de cabeça em coisas que ainda não dominava, como uso de _cookies para sessões_, _refresh e access JWT tokens_, _cors_ e políticas de segurança na aplicação usando o _@fastify/helmet_. Além disso, há muitos outros detalhes, como o uso do Zod, para validação de muitos dos dados necessários na aplicação e do Husky para padronizar commits e deixar todo o projeto mais profissional.

As tecnologias utilizadas em produção são:

- NodeJs;
- Knex;
- Zod;
- PM2;
- Fastify;
- Fastify Cors;
- Fastify Cookies;
- Fastify Helmet;
- Fastify JWT;
- Bcrypt e;
- PostgreSQL.

E em desenvolvimento:

- TypeScript;
- Tsup;
- Tsx;
- ESLint;
- Prettier;
- Husky;
- Supertest;
- Vitest e;
- SQLite3.

**A aplicação já conta com a configuração do Cors, é só utilizar o arquivo `.env` para informar a URL do seu front-end (todas as variáveis de ambiente necessárias para desenvolvimento, produção e testes estão exemplificadas nos arquivos: [.env.example](./.env_example) e [.env.test.example](./.env.test.example)).**

## Pré-requisitos

Para iniciar o projeto e poder testar as rotas (já configuradas caso você use o Insomnia no arquivo: [Insomnia_Requests.json](./Insomnia_Requests.json)) você vai precisar, antes de tudo, instalar as dependências do projeto e rodar as migrações (criar as tabelas) do banco de dados.

Vá até a pasta raiz do projeto após o clonar e escreva os seguintes comandos:

```bash
npm i

# Se estiver em ambientes Linux/Mac
npm run knex -- migrate:latest

# Se estiver em ambientes Windows
npm run knexWin -- migrate:latest
```

E então é só colocar a aplicação para rodar:

```bash
npm run dev
```

O código está preparado para ir para produção, só seria necessário a instanciação do banco de dados em algum provedor junto do backend, assim qualquer front-end poderia consumir essa API por meio de suas rotas.

Caso queira dar deploy na aplicação é necessário, além da instalação das dependências e aplicação da migrações, _buildar_ o código e o iniciar com o PM2. Aqui está o passo a passo dos comandos necessários:

```bash
npm i

# Em ambientes Windows use: npm run knexWin -- migrate:latest
npm run knex -- migrate:latest

npm run build

npm start
```

> Lembrando que este é um repositório de estudo, logo, não me responsabilizo pelo uso dessa aplicação por parte de qualquer outra pessoa.

## License

Distribuído sob licença MIT. Veja [`LICENSE`](./LICENSE) para mais informações.

## Meta

Meus links:

- [Gmail](mailto:dev.eddyyxxyy@gmail.com?)
- [Github](https://github.com/eddyyxxyy)
- [LinkedIn](https://www.linkedin.com/in/eeddyyxxyy/)
- [Youtube](https://www.youtube.com/@eddyxide)
