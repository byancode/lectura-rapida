// script de lectura rapida


const textType = {
    letter: 'letter',
    word: 'word',
};
// seleccionamos el elemento custom-input
const customInput = document.querySelector('div.custom-input');
const config = {
    // que es lo que vamos a mostrar, letras o palabras
    type: textType.letter,
    // cuantas milisegundos mostraremos cada palabra o letra
    time: 70,
    // si queremos que se repita el texto
    loop: true,
    // cada cuantas palabras separamos por linea
    wordsPerLine: 5,
    // si queremos que se muestre unicamente la palabra o letra seleccionada
    onlySelected: false,
    // tamaño de la fuente
    fontSize: 30,
    // mostrar solo las palabras o letras que se han seleccionado
    showOnlySelected: false,
    // si queremos formatear el texto
    formatText: false,
    // si queremos resaltar las tildes
    highlightTildes: false,
    // cuantas palabras o letras por palabra se resaltaran
    highlightWords: 1,
};

const control = {
    // si el texto esta en pausa
    play: false,
    // posicion de la palabra o letra seleccionada
    position: 0,
};

let interval = null;
function rewind() {
    control.position = 0;
}
function stop() {
    pause();
    rewind();
}
function next() {
    const words = customInput.querySelectorAll(`span.word`);
    words.forEach((word, index) => {
        if (index >= control.position && index < control.position + config.wordsPerLine) {
            word.classList.add('selected');
        } else {
            word.classList.remove('selected');
        }
        if (index >= control.position + config.wordsPerLine) {
            word.classList.add('soft');
        } else {
            word.classList.remove('soft');
        }
    });
    control.position += config.wordsPerLine;
}
function play() {
    control.play = true;
    wrapper.classList.add('play');
    interval = setInterval(next, config.time);

}
function pause() {
    control.play = false;
    wrapper.classList.remove('play');
    interval && clearInterval(interval);
}

function togglePlay() {
    if (control.play) {
        pause();
    } else {
        play();
    }
}
// modificamos el tamaño de la fuente
customInput.style.fontSize = `${config.fontSize}px`;

// transformaremos el texto en html span cada palabra y dentro de cada palabra un span para cada letra
function transformText(text) {
    text = text.replace(/\S+/g, function(word) {
        return `<span class="word">${word.replace(/./g, '<span class="letter">$&</span>')}</span>`;
    });
    // remplazamos los saltos de linea que esten dentro de ninguna etiqueta html por un br
    text = text.replace(/(?<=^|>)[^<]+?(?=<|$)/g, function(word) {
        return word.replace(/\n/g, '<span class="br">&#x0a;&#8205;</span>');
    });
    // remplazamos los espacios por un span vacio que esten dentro de ninguna etiqueta html
    text = text.replace(/(?<=^|>)[^<]+?(?=<|$)/g, function(word) {
        return word.replace(/\s/g, '<span class="space">&#160;</span>');
    });

    return text;
}

// creamos un span para cada letra
function createLetters() {
    const text = customInput.innerText;
    customInput.innerHTML = transformText(text);
}

// guardamos la ubicacion del cursor de la letra seleccionada de customInput
function getCursorPosition() {
    try {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rangeCopy = range.cloneRange();
        rangeCopy.selectNodeContents(customInput);
        rangeCopy.setEnd(range.endContainer, range.endOffset);
        return rangeCopy.toString().length;
    } catch (error) {
        return 0;
    }
}

function getNodeOfCusorPositionInSelection() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    return node;
}

function getNodeOfCursorFocus() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    return node;
}

function getAllSpanFromCustomInput() {
    return [...customInput.querySelectorAll('span:not(.word)')];
}

function getSpanByPosition(position) {
    const spans = getAllSpanFromCustomInput();
    return spans[position];
}


// ingresamo la ubicacion del cursor en la letra seleccionada de customInput
function setCursorPosition(cursorPosition) {
    const node = getSpanByPosition(cursorPosition - 1);

    if (!node) {
        return;
    }

    setCursorPositionByNode(node);
}

function setCursorPositionByNode(node) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(node, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

function getNodeElementOnCursor() {
    try {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        return node;
    } catch (error) {
        return null;
    }
}

function setClassOnNodeByPosition(className) {
    const node = getNodeElementOnCursor()

    if (!node) {
        return;
    }
    let element = node;

    // parent element if node is a text node
    if (node.nodeType === 3) {
        element = node.parentElement;
    }

    addAndRemoveClassOnNode(element, className);
    addAndRemoveClassOnNode(element.parentElement, className);
    getSiblings(element.parentElement).forEach(sibling => {
        sibling.childNodes.forEach(child => {
            child?.classList?.remove(className);
        });
    });
}

function addAndRemoveClassOnNode(element, className) {
    element?.classList?.add(className);
    // remove class on sibling nodes
    removeClassOnNodeSiblings(element, className);
}

function removeClassOnNodeSiblings(element, className) {
    getSiblings(element).forEach(sibling => sibling?.classList?.remove(className));
}

function createSpanBrNode() {
    const span = document.createElement('span');
    span.className = 'br';
    span.innerHTML = '&#x0a;&#8205;';
    return span;
}

function getNodeElement(node) {
    if (node.nodeType === 3) {
        return node.parentElement;
    }
    return node;
}

function getSiblings(element) {
    var nodes = [];
    let sibling = element.previousSibling;
    while (sibling) {
        nodes.push(sibling);
        sibling = sibling.previousSibling;
    }
    sibling = element.nextSibling;
    while (sibling) {
        nodes.push(sibling);
        sibling = sibling.nextSibling;
    }
    return nodes;
}

function handleInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        return;
    }
    if (customInput.innerText.length === 0) {
        return;
    }
    let cursorPosition = getCursorPosition();
    console.log(cursorPosition);
    createLetters();
    setCursorPosition(cursorPosition);
    handleCursorPosition();
}

function handleCursorPosition() {
    if (customInput.innerText.length === 0) {
        return;
    }
    setTimeout(() => setClassOnNodeByPosition('cursor'), 1);
}

function handleActions(event) {
    if (event.key !== 'Enter') {
        return;
    }
    event.preventDefault();

    const nodeCursor = getNodeElementOnCursor();
    if (!nodeCursor) {
        return;
    }

    const node = getNodeElement(nodeCursor);
    const nodes = getAllSpanFromCustomInput();
    const nodeIndex = nodes.indexOf(node);
    // remove prev child element of parent if backspace
    if (event.key === 'Enter') {
        const spanBr = createSpanBrNode();
        // if last node
        if (nodeIndex === nodes.length - 1) {
            customInput.appendChild(spanBr);
            customInput.appendChild(document.createElement('span'));
        } else {
            node.parentElement.insertBefore(spanBr, node.nextSibling);
        }
        setTimeout(() => setCursorPositionByNode(spanBr), 1);
    }
    handleCursorPosition();
}


const button = {
    textIncrease: document.querySelector('#text-increase'),
    textDecrease: document.querySelector('#text-decrease'),
    wrapper: document.querySelector('#wrapper'),
    rewind: document.querySelector('#rewind'),
    pause: document.querySelector('#pause'),
    play: document.querySelector('#play'),
};

// ejecutamos la funcion handleInput al momento de escribir en customInput
customInput.addEventListener('input', handleInput);
customInput.addEventListener('click', handleCursorPosition);
// event selectionchange
customInput.addEventListener('keydown', handleActions);

button.textIncrease.addEventListener('click', () => {
    config.fontSize += 1;
    customInput.style.fontSize = `${config.fontSize}px`;
});

button.textDecrease.addEventListener('click', () => {
    config.fontSize -= 1;
    customInput.style.fontSize = `${config.fontSize}px`;
});

button.rewind.addEventListener('click', () => {
    rewind();
});

button.pause.addEventListener('click', () => {
    pause();
});

button.play.addEventListener('click', () => {
    play();
});