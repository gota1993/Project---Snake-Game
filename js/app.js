window.ondragstart = () => false // disable dragging effect on main image
const canvas = document.querySelector('#myCanvas') // 
const con = canvas.getContext('2d') //
let game, newSnake
let loop = 0
let score = 0
// if local storage is already set, use it, or set default settings
let speed = localStorage.getItem('speed') ? localStorage.getItem('speed') : 10
let applesQuantity = localStorage.getItem('apples') ? localStorage.getItem('apples') : 1
let snakeLengthInitial = localStorage.getItem('snakeLength') ? localStorage.getItem('snakeLength') : 3
let id = localStorage.getItem('speedLevel') ? localStorage.getItem('speedLevel') : 'intermediate'
let highestScore = localStorage.getItem('highestScore') ? localStorage.getItem('highestScore') : 0

const step = 20
const mainImg = document.querySelector('#snake_main_img')
const playButton = document.querySelector('#start_play')
const levelButtons = document.querySelectorAll('.levels button')
const speeds = document.querySelectorAll('.speeds')
const snake = {
    speedX: 0,
    speedY: 0,
    tail: [{
        x: 5 * step, y: 5 * step
    }],
    snakeLength: snakeLengthInitial
}

resetGame = () => { // reset function
    snake.speedX = 0,
        snake.speedY = 0,
        snake.tail = [{
            x: 5 * step, y: 5 * step
        }],
        snake.snakeLength = snakeLengthInitial
}

levelButtons.forEach(button => button.addEventListener('click', (e) => {  //hidding and showing speeds by game level
    localStorage.setItem('speedLevel', id) // saving current values in local storage

    const levelSpeeds = document.querySelectorAll('.level_speeds')
    levelSpeeds.forEach(levelSpeed => levelSpeed.style.display = "none") //hiding all speeds

    levelButtons.forEach(button => button.classList.remove('selected')) //removing selected class(border)
    e.target.classList.add('selected') //adding selected class(border)

    id = e.target.getAttribute('id')
    document.querySelector(`.${id}_speeds`).style.display = "block" //showing selected speeds
}))

speeds.forEach(cSpeed => cSpeed.addEventListener('click', el => {
    speed = el.target.value // getting speed value and saving in variable
    speeds.forEach(speed => speed.classList.remove('selected')) //removing selected class(border)
    cSpeed.classList.add('selected') //adding selected speeds
    localStorage.setItem('speed', speed) // saving current values in local storage
}))

let snakesClicked = 0 // set snake length with plus/minus buttons. also save them in local storage
let snakePlusButton = document.querySelector('#snake_plus')
let snakeMinusButton = document.querySelector('#snake_minus')
let snakeLengthValue = document.querySelector('#snake_length')

snakePlusButton.addEventListener('click', () => { // snake plus button listener
    if (snakesClicked === 0) { //this heppens only once
        snakeLengthValue.textContent = 0 // changing value from string 'Auto' to number
        snakesClicked++
    }
    snakeLengthValue.textContent++
    snakeLengthInitial = snakeLengthValue.textContent
    localStorage.setItem('snakeLength', snakeLengthInitial) // saving current values in local storage
})

snakeMinusButton.addEventListener('click', () => { // snake minus button listener
    if (snakeLengthValue.textContent > 1) snakeLengthValue.textContent-- // minus works if number is greater than 1
    snakeLengthInitial = snakeLengthValue.textContent
    localStorage.setItem('snakeLength', snakeLengthInitial) // saving current values in local storage
})

let applesClicked = 0 // set apples quantity with plus/minus buttons. also save them in local storage
let applePlusButton = document.querySelector('#apple_plus')
let appleMinusButton = document.querySelector('#apple_minus')
let appleLengthValue = document.querySelector('#apple_length')

applePlusButton.addEventListener('click', () => { // apples plus button listener
    if (applesClicked === 0) { // this heppens only once
        appleLengthValue.textContent = 0 // changing value from string 'Auto' to number
        applesClicked = 1
    }
    appleLengthValue.textContent++
    applesQuantity = appleLengthValue.textContent
    localStorage.setItem('apples', applesQuantity) // saving current values in local storage

})
appleMinusButton.addEventListener('click', () => { // apples minus button listener
    if (appleLengthValue.textContent > 1) appleLengthValue.textContent-- // minus works if number is greater than 1
    applesQuantity = appleLengthValue.textContent
    localStorage.setItem('apples', applesQuantity) // saving current values in local storage
})

class Apple {
    constructor() {
        this.x = Math.floor(Math.random() * canvas.width / step) * step
        this.y = Math.floor(Math.random() * canvas.height / step) * step
    }
    draw() {
        const appleImg = new Image()
        appleImg.src = "images/Apple.png"
        con.drawImage(appleImg, this.x, this.y, step, step)
    }
}
class Snake {
    constructor(x, y, width, height, speedX, speedY) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speedX = speedX
        this.speedY = speedY
    }
    draw() {
        con.strokeStyle = 'white'
        con.strokeRect(this.x, this.y, this.width, this.height)
        con.fillStyle = 'green'
        con.fillRect(this.x, this.y, this.width, this.height)
    }
}
class Board {
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.width = canvas.width
        this.height = canvas.height
        this.color = color
    }

    draw() {
        con.fillStyle = this.color
        con.fillRect(this.x, this.y, this.width, this.height)
    }
}
class Score {
    constructor(score, x, y, fontsize, font, color) {
        this.score = score
        this.x = x
        this.y = y
        this.fontsize = fontsize
        this.font = font
        this.color = color
    }

    draw() {
        con.font = `${this.fontsize}px ${this.font}`
        con.fillStyle = this.color
        con.fillText(this.score, this.x, this.y)
    }
}
class Lines {
    constructor(moveToW, moveToH, lineToW, lineToH, lineWidth, color) {
        this.moveToW = moveToW
        this.moveToH = moveToH
        this.lineToW = lineToW
        this.lineToH = lineToH
        this.lineWidth = lineWidth
        this.color = color

    }

    draw() {
        con.beginPath()
        con.strokeStyle = this.color
        con.moveTo(this.moveToW, this.moveToH)
        con.lineTo(this.lineToW, this.lineToH)
        con.lineWidth = this.lineWidth
        con.stroke()
    }
}

playButton.addEventListener('click', () => {
    mainImg.style.display = "none" // hide homepage image
    canvas.style.display = "block" //show canvas
    cancelAnimationFrame(game)
    resetGame()

    const boardWidth = document.querySelector('#board_width') // getting width value from input
    const boardHeight = document.querySelector('#board_height') // getting height value from input

    if (boardHeight.value !== 'Previous') { // logic for setting canvas width and height with input values, also saving in local storage
        canvas.height = boardHeight.value
        localStorage.setItem('height', boardHeight.value)
    } else {
        canvas.height = localStorage.getItem('height')
    }
    if (boardWidth.value !== 'Previous') {
        canvas.width = boardWidth.value
        localStorage.setItem('width', boardWidth.value)
    } else {
        canvas.width = localStorage.getItem('width')
    }

    let newBoard = new Board(0, 0, 'black')

    const applesArray = [] // creating array to save multiple Array
    for (let i = 0; i < applesQuantity; i++) {
        newApple = new Apple()
        applesArray.push(newApple)
    }

    function draw() {
        newBoard.draw()

        let currentScore = new Score(`${score} apples / ${score * 10} points`, canvas.width - 150, 13, 16, 'Helvectica', 'white')
        currentScore.draw() // drawing current score
        let highestScore = new Score(`Highest Score - ${localStorage.getItem('highestScore') * 10}`, 10, 13, 16, 'Helvectica', 'white')
        highestScore.draw() // drawing highest score from local storage

        for (i = 0; i <= canvas.height; i += 20) { //drawing horizontal lines
            let newLine = new Lines(0, i, canvas.width, i, 0.2, 'grey')
            newLine.draw()
        }
        for (i = 0; i <= canvas.width; i += 20) { //drawing vertical lines
            let newLine = new Lines(i, 0, i, canvas.height, 0.2, 'grey')
            newLine.draw()
        }

        for (let i = 0; i < snake.tail.length; i++) {
            newSnake = new Snake(snake.tail[i].x, snake.tail[i].y, step, step)
            newSnake.draw() //drawing snake with looping array to get different x/y values from objects
        }

        for (let i = 0; i < applesQuantity; i++) { // drawing apple(s)
            applesArray[i].draw()
        }
    }

    window.addEventListener('keydown', key => {     // controling snake with keyboard arrows
        if (key.keyCode == '37' && snake.speedX === 0) { // left
            snake.speedY = 0
            snake.speedX = -step
        } else if (key.keyCode == '39' && snake.speedX === 0) { // right
            snake.speedY = 0
            snake.speedX = step
        } else if (key.keyCode == '38' && snake.speedY === 0) { // up
            snake.speedX = 0
            snake.speedY = -step
        } else if (key.keyCode == '40' && snake.speedY === 0) { // down
            snake.speedX = 0
            snake.speedY = step
        }
        if (snake.snakeLength === snakeLengthInitial) { // make score 0 until snake's first move
            score = 0
        }
    })

    function animate() {
        game = requestAnimationFrame(animate) // animation loop

        if (loop++ < speed) return //slowing down logic
        loop = 0

        draw() // calling draw function to draw everything
        newSnake.x = snake.tail[0].x + snake.speedX //changing X/Y coordinates by speed value
        newSnake.y = snake.tail[0].y + snake.speedY

        // logic which control snake going into one and going from other the wall
        if (newSnake.x < 0) newSnake.x = canvas.width - step  // if snake goes into left wall
        else if (newSnake.x > canvas.width - step) newSnake.x = 0 // if snake goes into right wall
        else if (newSnake.y < 0) newSnake.y = canvas.height - step // if snake goes into top wall
        else if (newSnake.y > canvas.height - step) newSnake.y = 0 //if snake goes into below wall

        snake.tail.unshift({ x: newSnake.x, y: newSnake.y }); //save where snake was moving, in array and also on the screen

        if (snake.tail.length > snake.snakeLength) snake.tail.pop() // if moving length is more than snake's length, remove from the array and also from the screen

        for (let i = 0; i < applesArray.length; i++) { // for cycle to loop through all apples
            if (newSnake.x === applesArray[i].x && newSnake.y === applesArray[i].y) { // if snake's head's position is equal to apple's position
                snake.snakeLength++              // add snake length
                score++                          // add score
                applesArray[i].x = Math.floor(Math.random() * canvas.width / step) * step  //add new apple with random position
                applesArray[i].y = Math.floor(Math.random() * canvas.height / step) * step
            }
        }

        for (let i = 1; i < snake.tail.length; i++) { // for cycle to check all snake's tails
            if (newSnake.x === snake.tail[i].x && newSnake.y === snake.tail[i].y) { // if snake's head's position is equal to any snake's tail
                // if current score is greater than highest score set current score as highest score
                if (localStorage.getItem('highestScore') < score) localStorage.setItem('highestScore', score)
                resetGame() // call reset function
            }
        }
    }
    requestAnimationFrame(animate)
})
