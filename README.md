# Zé Code <br> Desafio Backend
## 🍻 Apresentação

Zé Deliver é um aplicativo que nunca te deixa na mão quando acaba a cerveja, pois te permite pedir bebidas onde e como quiser. 

Além do aplicativo permitir essa dinâmica flexivel ao fazer seu pedido, você receberá sua cerveja sempre gelada, pronta para beber e no conforto de sua casa, uma vez que a empresa se baseia em uma rede de estabelecimentos e o aplicaitvo garente que o seu pedido sempre será encaminhado para o mais proximo de você para atender essas demandas. 

O projeto apresentando consiste na organização desses parceiros e construção de um programa que busque aquele que se encontra mais proximo da coordenada inserida pelo cliente. 

## 🧩 Variáveis

Antes de prosseguir com o projeto, é necessário declarar algumas variáveis globais, pois a aplicação precisa de algumas informações pessoais e sensíveis para prosseguir com as suas operações. 

Crie um arquivo `config.json` na raiz do projeto com a seguinte estrutura:

```
{
    "database": {
        "user": "SEU_USUARIO_MYSQL",
        "password": "SUA_SENHA_MYSQL",
        "host": "127.0.0.1",
        "database": "NOME_DO_BANCO",
        "port": 3306
    },
    "api_key": {
        "value": "SUA_API_KEY_DO_GOOGLE_MAPS"
    }
}
```

As informações do **database** são importantes para configurar o banco de dados do projeto, enquanto a **api_key** é a chave de acesso para a conexão com o Google Maps. 

**VARIÁVEIS DO BANCO**

Para obter as informações do banco de dados é necessário seguir os seguintes passos:

1. Instale o MySQL
2. Crie um banco de dados
```
mysql -u root -p
CREATE DATABASE Ze_Code;
```
3. Consulte as credenciais
   - user: Normalmente root para desenvolvimento local
   - password: A senha que você definiu durante a instalação
   - host: 127.0.0.1 ou localhost para servidor local
   - database: Ze_Code (ou nome que você criou)
   - port: 3306 (porta padrão do MySQL)
  
**API GOOGLE MAPS**

Para obter a sua chave, siga os seguintes passos:

1. Acessar Google Cloud Console:
    - Vá para Google Cloud Console
    - Faça login com sua conta Google
    - Crie um novo projeto ou selecione um existente
      
2. Ativar APIs Necessárias:
   - No menu lateral, vá para APIs & Services → Library
   - Pesquise e ative Maps JavaScript API
   - Vá para APIs & Services → Credentials
   - Clique em + CREATE CREDENTIALS → API Key
   - Uma nova chave será gerada
     
3. Copiar a Chave:
    - A chave terá formato: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    - Copie e cole no campo "value" do config.json

## 🐍 Ambiente Python 

Os códigos Python precisam antes de uma operação de download para as bibliotecas importadas. Esses códigos populam o banco de dados com as informações dos parceiros, mas deve-se salientar que não fundamentais para o projeto, pois as consultas web são realizadas diretamente no arquivo .JSON dos parceiros e não no banco. 

Caso deseje popular o banco para melhor organização, prepare o ambeinte python com as seguintes etapas:

1. Acesse o diretório do projeto
```
cd /caminho/para/Ze-Code_backend
```

2. Crie o ambiente virtual
```
python -m venv venv
```

3. Ative o ambiente virtual
```
venv\Scripts\activate
```

4. Instale as dependências necessárias
```
pip install -r requirements.txt
```

## 💾 Banco de Dados

O banco de dados do projeto tem como objetivo organizar em tabelas as informações dos parceiros deste arquivo [JSON](pdvs.json)

**MODELO ENTIDADE RELACIONAMENTO**

<br>
<div align="center">
  <img src="./Images/Diagrama.jpg">
  <p align="center"> Diagrama que representa as relações entre as entidades no banco </p>
</div>

<br>
<div align="center">
  <img src="./Images/relacionamento.png" widht=600 height=600>
  <p align="center"> Representação ER do projeto no formato das tabelas </p>
</div>
<br>

**TABELAS** <br>

Apresentação das tabelas presentes no banco de dados

- pdvs.csv → tabela bruta que é a versão convertida do JSON direto em csv. As próximas tabelas foram criadas derivadas dessa para criar as entidades do banco de dados.

- Parceiros.csv → armazena as informações principais de cada parceiro do Zé Deliver. No JSON, essa tabela engloba os campos `tradingName`, `ownerName` e `document`

- CoverageAreas.csv → as informações seguem o padrão `GeoJSON MultiPolygon` para desenhar a area de atuação de cada parceiro. No JSON, essa tabela engloba os campos `coverageArea` e `type` para cada um 
dos clientes, representados pelo <ins> id </ins>	

- Parceiros.csv → armazena as coordenadas do endereço de cada parceiro do Zé Deliver. No JSON, essa tabela engloba os campos `adress` e `type`

**Extra:** a pasta ['Popular_bancos'](BDs/Popular_bancos) dentro do diretorio 'BDs' possui os codigos python desenvolvidos para manipular a tabela pdvs.csv e popular as tabelas/entidades do banco de dados

As tabelas do banco de dados se encontram [aqui](BDs)
<br>

**MANIPULAR BANCO** 

No SQL, o usuario pode executar alguns comandos para ter uma leitura melhor do banco de dados e suas relações

1. Unir algum parceiro pelo seu id à sua respectiva coverageArea:
  ```
  SELECT Pdvs.trading, CoverageArea.type, CoverageArea.coordinates
  FROM Pdvs
  RIGHT JOIN CoverageArea
  ON Pdvs.id = CoverageArea.id
  WHERE Pdvs.id = [escolha_id];
  ```
## 🌐 Site

O site do Zé Code te permite escolher tanto entre adicionar o id de um parceiro e encontrar sua coverageArea no Google Maps quanto inserir um ponto em latitude e longitude para retornar aquele mais proximo de você.

Na construção desse sistema do site foi necessário um arquivo javascript que interpreta as informações de coordenada de cada parceiro a partir do arquivo json com todas as informações. Após manipular esses dados, as coordenadas do parcceiro, salvas em uma lista de dicionários, são lidas pela API do Google Maps para criar um poligono com sua localização geografica no mapa. 

<br>

<div align="center">
  <img src="./Images/id_gif.gif" widht=700 height=700>
  <p align="center"> Utilizando a função de achar parceiro pelo Id </p>
</div>
<br>

Além disso, o arquivo js também incorpora uma função responsável por ler coordenadas de um ponto no plano cartesiano passadas pelo usuário e buscar se ele está contido na coverage area de algum parceiro. Caso não esteja na área de atuação de algum deles, o programa retorna aquele no qual o endereço é o mais próximo do ponto passado pelo usuário. 

<br>

<div align="center">
  <img src="./Images/coords_gif.gif" widht=700 height=700>
  <p> Passando uma coordenada para buscar o parceiro mais próximo </p>
</div>

<br>

O codigo se encontra [aqui](scripts/index.js). Já para visitar o site, basta acessar o [arquivo html](templates/home.html) e abri-lo em seu navegador. 

## 👨‍💻 Desenvolvedor
Responsável pela criação do projeto

Diego - Programação e documentação <br>
Email: diego.dpab@gmail.com <br>
Conheça mais acessando o GitHub do desenvolvedor [aqui](https://github.com/Di3go07)!
