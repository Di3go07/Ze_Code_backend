/*
=== index.js ===
O código cria uma operação para o menu da sessão maps da página. Priemeiramente, o código define um padrão de busca por meio dos radios buttons, podendo ser por meio do id de um parceiro (padrão) ou as coordenadas fornecidas pelo usuário. Quando o botão de busca é clicado, a aplicação consulta qual padrão foi escolhido pelo usuário e o redireciona para sua respectiva função.
Caso a opção seja "id", o código procura no banco de dados a área de atuação de delivery do parceiro com esse id e constroi a sua área de atuação do mapa.
Caso a opção seja "cords", o código faz uma verificação para conferir se o usuário está em alguma área de atuação e a imprime no mapa. Se não estiver, procura aquele mais próixmo dessa localização.
*/

// == VARIÁVEIS GLOBAIS ==

let parametro_busca = "id";

// == FUNÇÔES ==

window.onload = function() {
    /*
    Essa função lida com os elementos quando a página é recarregada para evitar erros inesperados
    */
    const input = document.getElementById('input_field');
    input.value = '';
    setupEventListeners();

};

function alterarParametro(value){
    /*
    Essa função recebe o valor atual dos radio buttons - id ou cords - da sessão menu e define na variável global a opção de busca escolhida pelo usuário.
    Além disso, ela também atualiza os textos no menu para corresponder ao método escolhido.
    */
    const mensagem = document.getElementById("input_message");
    const input = document.getElementById("input_field");
    const input_error = document.getElementById("message");

    if (value == "cords"){
        mensagem.textContent = "Coordenada atual";
        input.placeholder = "x,y"
        parametro_busca = "cords";

        input.value = '';

        input_error.style.display = "none";
    } else {


        mensagem.textContent = "ID do parceiro";                  //altera a mensagem
        input.placeholder = "Número de 0 a 50"
        parametro_busca = "id";                                   //define o padrão de busca atual

        input.value = '';                                         //reseta o input

        input_error.style.display = "none";                       //reseta a mensagem de erro no input
    }
}

function handleParametro(){
    /*
    O principio dessa função é ler a entrada do usuário no campo input e redirecionar corretamente à função de renderização do mapa respectiva ao padrão de busca escolhido por ele.
    */

    const input = document.getElementById('input_field');
    const message = document.getElementById("message");

    //trata inputs vazios ao clicar no botão
    if (!input.value){
        message.style.display = "block";
        message.style.textDecoration = "none";
        message.style.color = "red";
        message.style.fontWeight = 600;
        message.textContent = "Insira um valor no campo";
        return; //reseta a função caso esteja vazio
    }

    //verifica qual o padrão de busca escolhido pelo usuário
    switch(parametro_busca){
        case "id":
            if (Number.isInteger(Number(input.value)) && input.value <= 50 && input.value >= 0){
                message.style.display = "none";
                const partner_id = input.value;
                acharComId(partner_id);
            } else {
                message.style.display = "block";
                message.textContent = "Insira um número entre 0 e 50";
            }
            break;

        case "cords":
            //validação do input
            let regex = /^[+-]?\d+(?:\.\d+)?\s*,\s*[+-]?\d+(?:\.\d+)?$/;

            if (regex.test(input.value)){
                message.style.display = "none";
                const partner_coords = input.value;
                acharComCoords(partner_coords)
            } else {
                message.style.display = "block";
                message.textContent = "Coordenado inválida. Ex: 14.576, -26.654";
            }
            break;

        default:
            console.log("Erro no radio button");
            break;
    }
}

async function initMap(partnerCoords){
    /*
    Essa função recebe uma lista com dicionários de coodernadas em latitude e longitude para desenhar a área de atuação do delivery do parceiro em um mapa através de uma API do Google Maps
    */
    // Cria o mapa
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: partnerCoords[0], //centraliza com base na posição de um dos pontos do poligono
        mapTypeId: "roadmap",
    });

    document.getElementById("map").style.border = "none"; //tira a estilização da div antes de ter um mapa

    // Constroi o poligono
    const partnerPolygon = new google.maps.Polygon({
        paths: partnerCoords, //cria o poligono com base nas coordenadas da lista
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
      });

      partnerPolygon.setMap(map);
}

async function  acharComId(id){
    /*
    Essa função recebe o id de um dos parceiros e filtra no arquivo .JSON apenas as coordenadas da localização geográfica dele
    */
   const request = "https://raw.githubusercontent.com/ab-inbev-ze-company/ze-code-challenges/refs/heads/master/files/pdvs.json"; //caminho para o arquivo
   const response = await fetch(request); //entra em contato com a API 
   const dados = await response.json()  //resgata as informações do arquivo JSON

   //filtrar dados do parceiro
   const partner_name = dados.pdvs[id]['tradingName'];                              //nome do parceiro
   const coords_len = dados.pdvs[id]['coverageArea']['coordinates'][0][0].length;   //quantidade de pontos da sua CoverageArea
   
   //iterar as coordendas 
   const partner_cordenadas =  []; //lista de dicionários com cada uma das coordenadas no eixo x e y 
   for (let i = 0; i < coords_len; i++)  {                                                    //itera sobre cada ponto da coverageArea de um parceiro para resgatar sua coordenada
    eixo_x = dados.pdvs[id]['coverageArea']['coordinates'][0][0][i][1];            //resgata o valor ddo ponto no eixo x
    eixo_y = dados.pdvs[id]['coverageArea']['coordinates'][0][0][i][0];            //resgata o valor do ponto no eixo y
    partner_cordenadas.push({ lat: eixo_x, lng: eixo_y});                                     //adiciona a coordenada do ponto na lista
  }

  //renderizando os dados
  const mensagem_final = document.getElementById("mensagem_retorno");
  mensagem_final.textContent = `O delivery do "${partner_name}" atua nessa área` //exibindo mensagem 
  console.log(partner_cordenadas)
  initMap(partner_cordenadas) //chamando função para renderizar o mapa

}

async function acharComCoords(coords){
    /*
    Essa função recebe um par de coodenadas e analisa se elas estão na área de atuação de alguns dos delivers. Se não estiver, procura aquele mais próximo da localização passada.
    */
    const [lat, lng] = coords.split(",").map(Number); //converte as coordenadas digitas em uma lista de posição x e y
    const user_coords = [lng, lat];
    let achouParceiro = false                                                //variável booleana se o usuário está na coverageArea de algum parceiro

    //Chamando API
    const request = "https://raw.githubusercontent.com/ab-inbev-ze-company/ze-code-challenges/refs/heads/master/files/pdvs.json"; 
    const response = await fetch(request); 
    const dados = await response.json()  

    // 1° - iterar sobre cada parceiro para ver se as coordenadas do usuário estão em sua coverageArea
    for (let id = 0; id < 51 && !achouParceiro; id++) { 
        // FILTRAR COORDENADAS DO PARCEIRO
        const partner_name = dados.pdvs[id]['tradingName'];
        const coords_len = dados.pdvs[id]['coverageArea']['coordinates'][0][0].length;   //quantidade de pontos da sua CoverageArea
        
        //iterar as coordendas 
        const partner_cordenadas =  []; //lista de dicionários com cada uma das coordenadas no eixo x e y 
        for (let i = 0; i < coords_len; i++)  {                       //itera sobre cada ponto da coverageArea de um parceiro para resgatar sua coordenada
            const lng= dados.pdvs[id]['coverageArea']['coordinates'][0][0][i][0];            //resgata o valor ddo ponto no eixo x
            const lat = dados.pdvs[id]['coverageArea']['coordinates'][0][0][i][1];            //resgata o valor do ponto no eixo y
            partner_cordenadas.push([lng, lat]);                                     //adiciona a coordenada do ponto na lista
        }

        //VERIFICA SE PARCEIRO CONTÊM POSIÇÃO DO USUÁRIO
        const polygon = turf.polygon([partner_cordenadas]);         // Criando o polígono com Turf.js
        const point = turf.point(user_coords);               // Criando o ponto do usuário com Turf.js

        if (turf.booleanPointInPolygon(point, polygon)) {     // Verificando se o ponto está dentro da área de cobertura
            achouParceiro = true;
            initMap(partner_cordenadas.map(c => ({ lng: c[0], lat: c[1] })))  //passa as coordendas do parceiro para a função criar o mapa
            const mensagem_final = document.getElementById("mensagem_retorno");
            mensagem_final.textContent = `Você pode pedir um delivery no "${partner_name}"` //exibindo mensagem 
        } else {
            continue                                         //continua a busca caso a coverageArea não contenha o ponto
        }
    }

    //2° Caso não esteja na área de cobertura de um parceiro, procura aquele mais próximo
    if (achouParceiro !== true) {
        //variáveis a serem atualizadas
        let menor_distancia = Number.POSITIVE_INFINITY //menor distância
        let id_maisProximo = 0  //id do parceiro mais proximo

        //itera cada coordenada de todos os parceiros
        for (let id = 0; id < 51; id++)  { //itera sobre cada parceiro
            const eixo_x = dados.pdvs[id]['address']['coordinates'][0]; //resgata um ponto do endereço do parceiro no plano
            const eixo_y = dados.pdvs[id]['address']['coordinates'][1];
            
            const user_x = lng;
            const user_y = lat;
    
            //CALCULA DISTÂNCIA
            let dAB = Math.sqrt(Math.pow(( user_x - eixo_x), 2) + Math.pow(( user_y - eixo_y), 2));
            
            if (dAB < menor_distancia)  { 
            menor_distancia = dAB; //caso o valor obtida seja menor que o até então menor, ela é salva como a menor distância
            id_maisProximo = id
            }  
        }

        // FILTRAR COORDENADAS DO PARCEIRO MAIS PRÓXIMO
        const partner_name = dados.pdvs[id_maisProximo]['tradingName'];
        const coords_len = dados.pdvs[id_maisProximo]['coverageArea']['coordinates'][0][0].length;   //quantidade de pontos da sua CoverageArea

        //iterar as coordendas 
        const partner_cordenadas =  []; //lista de dicionários com cada uma das coordenadas no eixo x e y 
        for (let i = 0; i < coords_len; i++)  {                                                    //itera sobre cada ponto da coverageArea de um parceiro para resgatar sua coordenada
            const eixo_x = dados.pdvs[id_maisProximo]['coverageArea']['coordinates'][0][0][i][1];            //resgata o valor ddo ponto no eixo x
            const eixo_y = dados.pdvs[id_maisProximo]['coverageArea']['coordinates'][0][0][i][0];            //resgata o valor do ponto no eixo y
            partner_cordenadas.push({ lat: eixo_x, lng: eixo_y});                                     //adiciona a coordenada do ponto na lista
        }

        // CRIA O MAPA COM A ÁREA DO PARCEIRO MAIS PRÓXIMO
        initMap(partner_cordenadas); 
        const mensagem_final = document.getElementById("mensagem_retorno");
        mensagem_final.textContent = `Delivery indisponível na sua região. "${partner_name}" é o parceiro mais próximo de você` 
    }
}

// == HTML OPERATIONS ==

// Alterando parâmetros da busca
const form = document.getElementById("meuForm");
form.addEventListener("change", (e) => alterarParametro(e.target.value));

//Ativar botão de busca
const button = document.getElementById("input_button");
button.addEventListener("click", handleParametro);