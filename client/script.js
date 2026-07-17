// ==========================================
// CONEXÃO SOCKET.IO
// ==========================================

const socket = io();


// ==========================================
// ELEMENTOS HTML
// ==========================================

const menu = document.getElementById("menu");
const waiting = document.getElementById("waiting");
const game = document.getElementById("game");


const createRoomBtn =
document.getElementById("createRoom");


const joinRoomBtn =
document.getElementById("joinRoom");


const playerNameInput =
document.getElementById("playerName");


const roomInput =
document.getElementById("roomCode");


const roomID =
document.getElementById("roomID");


const statusText =
document.getElementById("status");


const resultText =
document.getElementById("result");


const player1Name =
document.getElementById("player1");


const player2Name =
document.getElementById("player2");


const score1 =
document.getElementById("score1");


const score2 =
document.getElementById("score2");


const myChoice =
document.getElementById("myChoice");


const enemyChoice =
document.getElementById("enemyChoice");


const playAgainBtn =
document.getElementById("playAgain");


// ==========================================
// VARIÁVEIS DO JOGADOR
// ==========================================

let currentRoom = null;

let myPlayerId = null;

let myPlayerNumber = null;

let alreadyPlayed = false;



// ==========================================
// ÍCONES DAS JOGADAS
// ==========================================

const icons = {

    rock:"🪨",

    paper:"📄",

    scissors:"✂️"

};



// ==========================================
// CRIAR SALA
// ==========================================


createRoomBtn.onclick = ()=>{


    startMusic();


    let name =
    playerNameInput.value.trim();



    if(!name){

        name="Jogador";

    }



    socket.emit(
        "createRoom",
        name
    );


};




// ==========================================
// SALA CRIADA
// ==========================================


socket.on(
"roomCreated",
code=>{


    currentRoom = code;


    myPlayerId =
    socket.id;



    myPlayerNumber = 1;



    roomID.innerHTML =
    code;



    menu.classList.add(
        "hidden"
    );


    waiting.classList.remove(
        "hidden"
    );


});




// ==========================================
// ENTRAR NA SALA
// ==========================================


joinRoomBtn.onclick = ()=>{


    startMusic();



    let name =
    playerNameInput.value.trim();



    if(!name){

        name="Jogador";

    }



    currentRoom =
    roomInput.value
    .toUpperCase();



    socket.emit(
        "joinRoom",
        {

            room:
            currentRoom,

            name:name

        }
    );


};



// ==========================================
// ERRO
// ==========================================


socket.on(
"errorRoom",
msg=>{


    alert(msg);


});



// ==========================================
// JOGO COMEÇOU
// ==========================================


socket.on(
"gameStart",
data=>{


    currentRoom =
    data.room;



    menu.classList.add(
        "hidden"
    );


    waiting.classList.add(
        "hidden"
    );


    game.classList.remove(
        "hidden"
    );



    const players =
    data.players;



    player1Name.innerHTML =
    players[0].name;


    player2Name.innerHTML =
    players[1].name;



    const index =
    players.findIndex(
        p =>
        p.id === socket.id
    );



    myPlayerNumber =
    index + 1;



    myPlayerId =
    socket.id;



    statusText.innerHTML =
    "Escolha sua jogada";


});



// ==========================================
// ESCOLHER JOGADA
// ==========================================


const choices =
document.querySelectorAll(".choice");



choices.forEach(button=>{


    button.onclick = ()=>{


        if(alreadyPlayed)
            return;



        const move =
        button.dataset.choice;



        alreadyPlayed = true;



        button.classList.add(
            "selected"
        );



        socket.emit(
            "playerMove",
            {

                room:
                currentRoom,

                move:
                move

            }
        );



        statusText.innerHTML =
        "Esperando adversário...";


    };


});




// ==========================================
// RESULTADO DA RODADA
// ==========================================


socket.on(
"roundResult",
data=>{


    myChoice.innerHTML =
    icons[
        data[
            myPlayerNumber === 1
            ?
            "p1Move"
            :
            "p2Move"
        ]
    ];



    enemyChoice.innerHTML =
    icons[
        data[
            myPlayerNumber === 1
            ?
            "p2Move"
            :
            "p1Move"
        ]
    ];



    score1.innerHTML =
    data.score1;


    score2.innerHTML =
    data.score2;



    if(data.result === 0){


        resultText.innerHTML =
        "🤝 EMPATE";


    }


    else if(

        data.result === myPlayerNumber

    ){


        resultText.innerHTML =
        "🏆 VOCÊ VENCEU!";


        resultText.className =
        "win";


    }


    else{


        resultText.innerHTML =
        "💀 VOCÊ PERDEU";


        resultText.className =
        "lose";


    }



    statusText.innerHTML =
    "Fim da rodada";



    alreadyPlayed = false;


});



// ==========================================
// NOVA RODADA
// ==========================================


socket.on(
"newRound",
()=>{


    myChoice.innerHTML =
    "❔";


    enemyChoice.innerHTML =
    "❔";


    resultText.innerHTML =
    "";


    resultText.className =
    "";


    statusText.innerHTML =
    "Escolha sua jogada";


});




// ==========================================
// BOTÃO JOGAR NOVAMENTE
// ==========================================


playAgainBtn.onclick = ()=>{


    socket.emit(
        "playAgain",
        currentRoom
    );


};




// ==========================================
// ADVERSÁRIO SAIU
// ==========================================


socket.on(
"opponentLeft",
()=>{


    alert(
        "Seu adversário saiu."
    );


    game.classList.add(
        "hidden"
    );


    menu.classList.remove(
        "hidden"
    );


});



// ==========================================
// MÚSICA
// ==========================================


function startMusic(){


    const music =
    document.getElementById(
        "bgMusic"
    );


    if(!music)
        return;



    music.volume =
    0.35;



    music.play()
    .catch(()=>{});


}