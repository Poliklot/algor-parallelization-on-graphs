let currentGraph;
let sa;

function generateRandomIncidenceMatrix(numNodes, numEdges) {
    let a = 0,b = 0,c = 0;
    var matrix = [];
    var usedWeights = {}; // объект для хранения использованных весов

    for (var i = 0; i < numNodes; i++) {
        var nodeEdges = [];
        while (nodeEdges.length < numEdges) { // замена вложенного цикла
            var node = Math.floor(Math.random() * numNodes);
            
            while ((node === i) || (nodeEdges.find(x => x.v == node)) || (matrix[i]?.find(x => x.v = node))) {   
                node = Math.floor(Math.random() * numNodes);
                if (a++ > 100) {
                    return false;
                }
                
            }
            var weight = Math.floor(Math.random() * 10) + 1;
            while (usedWeights[i] && usedWeights[i][weight] || usedWeights[node] && usedWeights[node][weight]) {
                weight = Math.floor(Math.random() * 10) + 1;
                if (b++ > 100) {
                    return false;
                }
            }
            if (!usedWeights[i]) {
                usedWeights[i] = {};
            }
            usedWeights[i][weight] = true;
            if (!usedWeights[node]) {
                usedWeights[node] = {};
            }
            usedWeights[node][weight] = true;
            var edge = { v: node, w: weight };
            nodeEdges.push(edge);
        }
        matrix.push(nodeEdges);
    }
    return matrix;
}

function isValidMatrixForKCM(graph) {
    return !!(kcm(graph) != false);
}

function kcm(graph) {
    if (!graph) return false;
    const n = graph.length; // количество вершин
    const m = graph[0].length; // количество ребер
  
    const tree = []; // массив ребер остовного дерева
    const visited = new Array(n).fill(false); // массив посещенных вершин
  
    // начинаем с произвольной вершины
    visited[0] = true;
  
    // ищем минимальное ребро, соединяющее посещенную и непосещенную вершины
    while (tree.length < n - 1) {
      let minWeight = Infinity;
      let minRow = -1;
      let minCol = -1;
  
      for (let i = 0; i < n; i++) {
        if (visited[i]) {
          for (let j = 0; j < m; j++) {
            if (!visited[graph[i][j].v] && graph[i][j].w < minWeight) {
              minWeight = graph[i][j].w;
              minRow = i;
              minCol = j;
            }
          }
        }
      }
      if ((minRow == -1) || (minCol == -1)) return false
      // добавляем ребро в дерево и отмечаем вершину как посещенную
      tree.push(graph[minRow][minCol]);
      visited[graph[minRow][minCol].v] = true;
    }
  
    return tree;
}

const drawGraph = (data) => {
    let graph = currentGraph = Viva.Graph.graph();
    data.forEach((item, i) => {
        graph.addNode(i);
    })
    
    data.forEach((item, i) => {
        item.forEach(subitem => {
            graph.addLink(i, subitem.v, {weight: subitem.w});
        })
    })
    
    var graphics = Viva.Graph.View.svgGraphics();

    // Задаем отображение ребер
    graphics.link(function(link) {
        if ((!link.data) || (link.fromId == link.toId)) return null
        const g = Viva.Graph.svg('g');

        const line = Viva.Graph.svg('line')
        .attr('stroke', 'red')
        .attr('stroke-width', (1 + +link.data.weight * .1).toFixed(1))
        .attr('fill', 'red')
        .attr('data-from-id', link.fromId)
        .attr('data-to-id', link.toId)
        .attr('id', `l-${link.fromId}-${link.toId}`);
        g.linkObj = link;
    
        const label = Viva.Graph.svg('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', '600')
            .attr('fill', '#00d635');

        if (link.fromId > link.toId) label.attr('transform', 'translate(0, 20)')
    
        label.text(link.data.weight)

        g.append(line)
        // g.append(arrowHead);
        g.append(label)
        return g;
    })
    .placeLink(function(linkUI, fromPos, toPos) {
        linkUI.querySelector('line')
            .attr('x1', fromPos.x)
            .attr('x2', toPos.x)
            .attr('y1', fromPos.y)
            .attr('y2', toPos.y);

        const dx = toPos.x - fromPos.x,
            dy = toPos.y - fromPos.y,
            distance = Math.sqrt(dx * dx + dy * dy);
            
            linkUI.querySelector('text')
                .attr('x', (fromPos.x + toPos.x) / 2)
                .attr('y', (fromPos.y + toPos.y) / 2)
    });
    // graphics.link(function(link){
    //     ui = Viva.Graph.svg('line')
    //         .attr('stroke', 'red')
    //         .attr('stroke-width', (1 + +link.data.weight * .1).toFixed(1))
    //         .attr('fill', 'red')
    //         .attr('data-from-id', link.fromId)
    //         .attr('data-to-id', link.toId)
    //         .attr('id', `l-${link.fromId}-${link.toId}`);
    //     ui.linkObj = link;
    //     return ui;
    // })

    graphics.node(function(node){
        const ui = Viva.Graph.svg('g')
            .attr('id', `n-${node.id}`),
            svgText = Viva.Graph.svg('text')
            .attr('y', '-4px')
            .attr('x', '0px')
            .attr('fill', 'red'),
            svgRect = Viva.Graph.svg('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#00d635');

        ui.append(svgText)
        ui.append(svgRect)
        return ui;
    })
    .placeNode(function(nodeUI, pos) {
        nodeUI.attr('transform', `translate(${pos.x - 10 / 4}, ${pos.y - 10 / 2})`);
    });
    
    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength : 200,
        springCoeff : 0.0001,
        dragCoeff : 0.12,
        gravity : -11.1
    });
    
    var renderer = Viva.Graph.View.renderer(graph, {
        graphics: graphics,
        layout: layout,
        prerender: 300,
        container: document.querySelector('.graph-container')
    });
    renderer.run();
    
    // Zoom to fit hack
    const graphRect = layout.getGraphRect();
    const graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1) + 500;
    const screenSize = Math.min(document.body.clientWidth, document.body.clientHeight);
    
    const desiredScale = screenSize / graphSize;
    zoomOut(desiredScale, 1);
    
    function zoomOut(desiredScale, currentScale) {
        if (desiredScale < currentScale) {
            currentScale = renderer.zoomOut();
            setTimeout(function () {
                zoomOut(desiredScale, currentScale);
            }, 16);
        }
    }
}

let data = false;
while (data == false) {
    const matrix = generateRandomIncidenceMatrix(10,3);
    data = (isValidMatrixForKCM(matrix)) ? matrix : false;
}
drawGraph(data);

const findNewTree = (tree) => {
    document.querySelector(`.graph-container svg > g > g#n-0 rect`).setAttribute('fill', 'blue');
    tree.forEach((node, index, arr) => {
        document.querySelector(`.graph-container svg > g > g#n-${node.v} rect`).setAttribute('fill', 'blue');
        document.querySelector(`.graph-container svg g line[data-to-id="${node.v}"][stroke-width="${(1 + node.w * .1).toFixed(1)}"]`).setAttribute('stroke', 'blue');
    })
    
    document.querySelectorAll(`.graph-container svg g line[stroke="red"]`).forEach($line => {
        $line.parentElement.querySelector('text').setAttribute('fill', 'transaprent');
        $line.setAttribute('stroke', 'transaprent');
        $line.setAttribute('data-remove-link', '');
    });
}

const showGraph = () => {
    document.querySelectorAll('[data-remove-link]').forEach($link => {
        $link.parentElement.querySelector('text').setAttribute('fill', '#00d63544');
        $link.setAttribute('stroke', 'red');
    });
}

const hideGraph = () => {
    document.querySelectorAll('[data-remove-link]').forEach($link => {
        $link.parentElement.querySelector('text').setAttribute('fill', 'transparent');
        $link.setAttribute('stroke', 'transparent');
    });
}

// DOM

document.querySelector('#buttonCreateRandomGraph').addEventListener('click', () => {
    document.querySelector(`.graph-container svg`).remove();
    data = false;
    while (data == false) {
        const matrix = generateRandomIncidenceMatrix(10,3);
        data = (isValidMatrixForKCM(matrix)) ? matrix : false;
    }
    drawGraph(data);
    hideNavShowButton();
})

document.querySelector('#buttonFindAndShowTree').addEventListener('click', () => {
    const tree = kcm(data);
    findNewTree(tree);
    showNavShowButton();
})

let nowShowedGraph = false;

const $navShowButton = document.querySelector('.nav__show-button');
$navShowButton.addEventListener('click', () => {
    if (nowShowedGraph) {
        nowShowedGraph = false;
        hideGraph();
        navShowButtonStateSet('show');
    } else {
        nowShowedGraph = true;
        showGraph();
        navShowButtonStateSet('hide');
    }
})

const navShowButtonStateSet = (state) => {
    if (state == 'show') {
        $navShowButton.textContent = 'Показать граф';
    } else if (state == 'hide') {
        $navShowButton.textContent = 'Скрыть граф';
    }
}

const showNavShowButton = () => {
    $navShowButton.style.display = '';
    setTimeout(() => {
        $navShowButton.classList.remove('nav__show-button--hidden');
    }, 10)
}

const hideNavShowButton = () => {
    $navShowButton.classList.add('nav__show-button--hidden');
    setTimeout(() => {
        $navShowButton.style.display = 'none';
    }, 150)
}