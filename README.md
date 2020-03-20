# busca-legendas-api

Para usar o serviço, basta invocar o endpoint `/find` que possui apenas dois parâmetros obrigatórios:

    /find?title=NOME_DO_FILME&release=RELEASE_DO_FILME

O serviço vai retornar a melhor legenda disponível no [legendas.tv](http://legendas.tv) para o seu release utilizando algumas heurísticas.
