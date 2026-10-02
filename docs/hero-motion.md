# Direção de movimento do hero

O GRUPO E aparece como origem das conexões: sinais percorrem curvas entre a logo e as empresas. A composição usa um painel em areia clara, partículas em diferentes planos, conexões em bronze suave e cartões claros para integrar a composição ao fundo branco sem perder a leitura das linhas.

## Referências pesquisadas

- [Vanta NET](https://github.com/tengbao/vanta/blob/master/src/vanta.net.js): pontos em profundidade, conexões por proximidade e resposta suave ao cursor.
- [Three.js — BufferGeometry DrawRange](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_buffergeometry_drawrange.html): velocidades individuais dos pontos e intensidade das conexões conforme a distância.
- [particles.js](https://github.com/VincentGarreau/particles.js/blob/master/README.md): densidade, diferentes tamanhos, opacidade e movimento das partículas.

A implementação é própria, em Canvas 2D e SVG, usando as dependências existentes. O brilho das partículas é pré-renderizado em uma pequena textura para reduzir o custo de desenho.

## Comportamento

- A logo flutua e responde ao cursor com uma inclinação leve.
- Os pontos têm velocidades e profundidades diferentes; as curvas respiram e transportam pulsos de luz.
- Os quatro itens mantêm tempos independentes, com um a três visíveis e pelo menos um totalmente opaco.
- Cada sinal liga a logo à ponta esquerda da caixa correspondente e apaga mais rápido que a caixa.
- As animações param fora da área visível e respeitam `prefers-reduced-motion`.
- O cenário usa resolução de até 2× e libera Canvas, observadores e eventos ao desmontar.

## Verificação

`npm run verify:hero` observa a animação real no Chromium por 65 segundos em desktop e celular. Confere visibilidade, posição das pontas, ausência de sinais órfãos, partículas, movimento contínuo, resposta ao cursor, limpeza e movimento reduzido. `npm run build` valida a integração com Next.js.
