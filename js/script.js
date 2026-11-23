// DOM
const cenario = document.querySelector('#cenario')
const boneco = document.querySelector('#boneco')
const imgBoneco = document.querySelector('#boneco img')
const obstaculo = document.querySelector('#obstaculo')
const recompensa = document.querySelector('#recompensa')
const imgRecompensa = document.querySelector('#recompensa img')

let posicao = 0
const velocidade = 6

let indoEsquerda = false
let indoDireita = false
let andando = false
let jogoAtivo = true
let recompensaAtiva = true
let pontos = 0

const imgParado = '/public/imgs/chicken_static.png'
const imgAndando = '/public/imgs/chicken_run.gif'

// Cria o placar dinamicamente no canto superior direito do cenário
const placar = document.createElement('div')
placar.textContent = 'Pontos: 0'
placar.style.position = 'absolute'
placar.style.top = '16px'
placar.style.right = '20px'
placar.style.fontSize = '24px'
placar.style.fontWeight = 'bold'
placar.style.color = '#ffffff'
placar.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
placar.style.padding = '8px 16px'
placar.style.borderRadius = '8px'
placar.style.zIndex = '10'
cenario.appendChild(placar)

// Garante posicionamento e tamanho padrão caso ainda não tenha estilizado #recompensa no CSS
if (recompensa) {
    recompensa.style.position = 'absolute'
    if (recompensa.offsetWidth === 0 || recompensa.offsetWidth > 150) {
        recompensa.style.width = '50px'
        recompensa.style.height = '50px'
    }
    if (imgRecompensa) {
        imgRecompensa.style.width = '100%'
        imgRecompensa.style.height = '100%'
        imgRecompensa.style.objectFit = 'contain'
        imgRecompensa.style.imageRendering = 'pixelated'
    }
    posicionarRecompensa()
}

// Eventos
document.addEventListener('keydown', apertarTecla)
document.addEventListener('keyup', soltarTecla)
boneco.addEventListener('animationend', parar)

function apertarTecla(evento) {
    if (!jogoAtivo) return

    if (evento.key === 'ArrowUp') {
        boneco.classList.add('pulando')
    }
    if (evento.key === 'ArrowLeft') {
        indoEsquerda = true
    }
    if (evento.key === 'ArrowRight') {
        indoDireita = true
    }
}

function soltarTecla(evento) {
    if (evento.key === 'ArrowLeft') {
        indoEsquerda = false
    }
    if (evento.key === 'ArrowRight') {
        indoDireita = false
    }
}

// Loop contínuo de movimento e colisão (60 FPS)
function atualizar() {
    if (!jogoAtivo) return

    const limiteDireito = cenario.clientWidth - boneco.offsetWidth

    if (indoEsquerda && !indoDireita) {
        posicao = Math.max(0, posicao - velocidade)
        imgBoneco.style.transform = 'scaleX(-1)'
        trocarAnimacao(true)
    } else if (indoDireita && !indoEsquerda) {
        posicao = Math.min(limiteDireito, posicao + velocidade)
        imgBoneco.style.transform = 'scaleX(1)'
        trocarAnimacao(true)
    } else {
        trocarAnimacao(false)
    }

    boneco.style.left = posicao + 'px'

    verificarColisao()
    verificarRecompensa()

    if (jogoAtivo) {
        requestAnimationFrame(atualizar)
    }
}

function posicionarRecompensa() {
    if (!recompensa) return

    const maxLeft = cenario.clientWidth - recompensa.offsetWidth
    let randomLeft = Math.floor(Math.random() * (maxLeft + 1))

    // Evita reaparecer exatamente em cima da galinha
    let tentativas = 0
    while (Math.abs(randomLeft - posicao) < boneco.offsetWidth && tentativas < 10) {
        randomLeft = Math.floor(Math.random() * (maxLeft + 1))
        tentativas++
    }

    // Altura entre o chão da galinha e no máximo 1.25x a altura dela
    const chao = parseFloat(getComputedStyle(boneco).bottom) || 30
    const alturaMaxima = boneco.offsetHeight * 1.25
    const maxBottom = chao + Math.max(0, alturaMaxima - recompensa.offsetHeight)
    const randomBottom = Math.floor(Math.random() * (maxBottom - chao + 1)) + chao

    recompensa.style.left = randomLeft + 'px'
    recompensa.style.bottom = randomBottom + 'px'
}

function verificarRecompensa() {
    if (!recompensa || !recompensaAtiva) return

    const rectBoneco = boneco.getBoundingClientRect()
    const rectRecompensa = recompensa.getBoundingClientRect()

    const margemBoneco = 20
    const margemRecX = rectRecompensa.width * 0.35
    const margemRecY = rectRecompensa.height * 0.35

    const pegou =
        rectBoneco.right - margemBoneco > rectRecompensa.left + margemRecX &&
        rectBoneco.left + margemBoneco < rectRecompensa.right - margemRecX &&
        rectBoneco.bottom - margemBoneco > rectRecompensa.top + margemRecY &&
        rectBoneco.top + margemBoneco < rectRecompensa.bottom - margemRecY

    if (pegou) {
        recompensaAtiva = false
        recompensa.style.visibility = 'hidden'

        // Aumenta a pontuação e atualiza o placar na tela
        pontos++
        placar.textContent = 'Pontos: ' + pontos

        setTimeout(() => {
            posicionarRecompensa()
            recompensa.style.visibility = 'visible'
            recompensaAtiva = true
        }, 200)
    }
}

function verificarColisao() {
    const rectBoneco = boneco.getBoundingClientRect()
    const rectObstaculo = obstaculo.getBoundingClientRect()

    const margemBoneco = 20
    const margemObsX = rectObstaculo.width * 0.3
    const margemObsY = rectObstaculo.height * 0.3

    const colidiu =
        rectBoneco.right - margemBoneco > rectObstaculo.left + margemObsX &&
        rectBoneco.left + margemBoneco < rectObstaculo.right - margemObsX &&
        rectBoneco.bottom - margemBoneco > rectObstaculo.top + margemObsY &&
        rectBoneco.top + margemBoneco < rectObstaculo.bottom - margemObsY

    if (colidiu) {
        jogoAtivo = false
        trocarAnimacao(false)

        // Reseta a pontuação imediatamente ao bater no obstáculo
        pontos = 0
        placar.textContent = 'Pontos: ' + pontos

        obstaculo.style.animationPlayState = 'paused'
        boneco.style.animationPlayState = 'paused'

        const spanPerdeu = document.createElement('span')
        spanPerdeu.textContent = 'Você perdeu!'
        spanPerdeu.style.position = 'absolute'
        spanPerdeu.style.top = '50%'
        spanPerdeu.style.left = '50%'
        spanPerdeu.style.transform = 'translate(-50%, -50%)'
        spanPerdeu.style.fontSize = '48px'
        spanPerdeu.style.fontWeight = 'bold'
        spanPerdeu.style.color = '#ffffff'
        spanPerdeu.style.backgroundColor = 'rgba(0, 0, 0, 0.75)'
        spanPerdeu.style.padding = '16px 32px'
        spanPerdeu.style.borderRadius = '8px'
        spanPerdeu.style.zIndex = '10'

        cenario.appendChild(spanPerdeu)

        setTimeout(() => {
            location.reload()
        }, 1000)
    }
}

function trocarAnimacao(estaAndando) {
    if (andando !== estaAndando) {
        andando = estaAndando
        imgBoneco.src = estaAndando ? imgAndando : imgParado
    }
}

function parar() {
    boneco.classList.remove('pulando')
}

// Inicia o loop
requestAnimationFrame(atualizar)