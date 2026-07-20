// ======================================================
// PEDRA PAPEL TESOURA ONLINE
// SCRIPT.JS - PARTE 1
// ======================================================

// ==============================
// SOCKET
// ==============================

const socket = io();

// ==============================
// ELEMENTOS DA TELA
// ==============================

const menu = document.getElementById("menu");
const waiting = document.getElementById("waiting");
const game = document.getElementById("game");

const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");

const createPlayerName =
document.getElementById("createPlayerName");

const joinPlayerName =
document.getElementById("joinPlayerName");

const roomCodeInput =
document.getElementById("roomCode");

const roomCodeGame =
document.getElementById("roomCodeGame");

const roomID =
document.getElementById("roomID");

const player1 =
document.getElementById("player1");

const player2 =
document.getElementById("player2");

const score1 =
document.getElementById("score1");

const score2 =
document.getElementById("score2");

const myChoice =
document.getElementById("myChoice");

const enemyChoice =
document.getElementById("enemyChoice");

const status =
document.getElementById("status");

const result =
document.getElementById("result");

const playAgain =
document.getElementById("playAgain");

const musicButton =
document.getElementById("musicButton");

const music =
document.getElementById("bgMusic");

const choiceButtons =
document.querySelectorAll(".choice");

// ==============================
// VARIÁVEIS
// ==============================

let room = "";
let playerNumber = 0;
let played = false;
let musicStarted = false;

// ==============================
// ÍCONES
// ==============================

const icons = {

    rock:"🪨",

    paper:"📄",

    scissors:"✂️"

};

// ==============================
// MÚSICA
// ==============================

function startMusic(){

    if(musicStarted)
        return;

    musicStarted = true;

    music.volume = .35;

    music.play().catch(()=>{});

}

musicButton.onclick = ()=>{

    if(music.paused){

        music.play();

        musicButton.innerHTML="🔊 Música";

    }

    else{

        music.pause();

        musicButton.innerHTML="🔈 Música";

    }

};

// ==============================
// CRIAR SALA
// ==============================

createRoomBtn.onclick = ()=>{

    startMusic();

    let name =
    createPlayerName.value.trim();

    if(name==="")
        name="Jogador";

    socket.emit(

        "createRoom",

        name

    );

};

// ==============================
// ENTRAR NA SALA
// ==============================

joinRoomBtn.onclick = ()=>{

    startMusic();

    let name =
    joinPlayerName.value.trim();

    if(name==="")
        name="Jogador";

    room =
    roomCodeInput.value
    .trim()
    .toUpperCase();

    if(room===""){

        alert("Informe o código da sala.");

        return;

    }

    socket.emit(

        "joinRoom",

        {

            room,

            name

        }

    );

};

// ==============================
// SALA CRIADA
// ==============================

socket.on(

    "roomCreated",

    code=>{

        room = code;

        roomID.innerHTML = code;

        roomCodeGame.innerHTML = code;

        menu.classList.add("hidden");

        waiting.classList.remove("hidden");

    }

);

// ==============================
// ERRO
// ==============================

socket.on(

    "errorRoom",

    message=>{

        alert(message);

    }

);

// ==============================
// INÍCIO DO JOGO
// ==============================

socket.on(

    "gameStart",

    data=>{

        room = data.room;

        roomCodeGame.innerHTML = room;

        menu.classList.add("hidden");

        waiting.classList.add("hidden");

        game.classList.remove("hidden");

        const players =
        data.players;

        player1.innerHTML =
        players[0].name;

        player2.innerHTML =
        players[1].name;

        playerNumber =
        players.findIndex(

            p=>p.id===socket.id

        ) + 1;

        score1.innerHTML="0";
        score2.innerHTML="0";

        myChoice.innerHTML="❔";
        enemyChoice.innerHTML="❔";

        status.innerHTML=
        "Escolha sua jogada";

        result.innerHTML="";

        played=false;

    }

);

// ==============================
// ESCOLHER JOGADA
// ==============================

choiceButtons.forEach(button=>{

    button.onclick = ()=>{

        if(played)
            return;

        choiceButtons.forEach(b=>{

            b.classList.remove("selected");

        });

        button.classList.add("selected");

        const move =
        button.dataset.choice;

        myChoice.innerHTML =
        icons[move];

        played = true;

        status.innerHTML =
        "Esperando o adversário...";

        socket.emit(

            "playerMove",

            {

                room,

                move

            }

        );

    };

});
// ======================================================
// SCRIPT.JS - PARTE 2
// Continuação da Parte 1
// ======================================================

// ==============================
// RESULTADO DA RODADA
// ==============================

socket.on(

    "roundResult",

    data=>{

        const myMove =
        playerNumber === 1
        ? data.p1Move
        : data.p2Move;

        const enemyMove =
        playerNumber === 1
        ? data.p2Move
        : data.p1Move;

        myChoice.innerHTML =
        icons[myMove];

        enemyChoice.innerHTML =
        icons[enemyMove];

        score1.innerHTML =
        data.score1;

        score2.innerHTML =
        data.score2;

        result.classList.remove(
            "win",
            "lose"
        );

        if(data.result===0){

            result.innerHTML =
            "🤝 EMPATE";

        }

        else if(data.result===playerNumber){

            result.innerHTML =
            "🏆 VOCÊ VENCEU";

            result.classList.add(
                "win"
            );

        }

        else{

            result.innerHTML =
            "💀 VOCÊ PERDEU";

            result.classList.add(
                "lose"
            );

        }

        status.innerHTML =
        "Rodada finalizada";

        played=false;

    }

);

// ==============================
// NOVA RODADA
// ==============================

socket.on(

    "newRound",

    ()=>{

        myChoice.innerHTML="❔";

        enemyChoice.innerHTML="❔";

        result.innerHTML="";

        result.classList.remove(
            "win",
            "lose"
        );

        status.innerHTML=
        "Escolha sua jogada";

        played=false;

        choiceButtons.forEach(button=>{

            button.classList.remove(
                "selected"
            );

        });

    }

);

// ==============================
// BOTÃO JOGAR NOVAMENTE
// ==============================

playAgain.onclick = ()=>{

    socket.emit(

        "playAgain",

        room

    );

};

// ==============================
// ADVERSÁRIO SAIU
// ==============================

socket.on(

    "opponentLeft",

    ()=>{

        alert(
            "Seu adversário saiu da sala."
        );

        game.classList.add(
            "hidden"
        );

        waiting.classList.add(
            "hidden"
        );

        menu.classList.remove(
            "hidden"
        );

        room="";

        playerNumber=0;

        played=false;

        roomCodeInput.value="";

        status.innerHTML=
        "Escolha sua jogada";

        result.innerHTML="";

        score1.innerHTML="0";

        score2.innerHTML="0";

        myChoice.innerHTML="❔";

        enemyChoice.innerHTML="❔";

        choiceButtons.forEach(button=>{

            button.classList.remove(
                "selected"
            );

        });

    }

);

// ==============================
// DESCONECTOU DO SERVIDOR
// ==============================

socket.on(

    "disconnect",

    ()=>{

        alert(
            "Conexão perdida com o servidor."
        );

    }

);

// ==============================
// RECONECTOU
// ==============================

socket.on(

    "connect",

    ()=>{

        console.log(
            "Conectado ao servidor."
        );

    }

);

// ==============================
// LOG DE CONEXÃO
// ==============================

console.log(
    "Pedra Papel Tesoura Online iniciado."
);