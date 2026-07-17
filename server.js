// ==========================================
// IMPORTAÇÕES
// ==========================================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


// ==========================================
// CONFIGURAÇÃO DO SERVIDOR
// ==========================================

const app = express();

const server = http.createServer(app);

const io = new Server(server);


// Servir arquivos do jogo
app.use(express.static("client"));


// ==========================================
// MEMÓRIA DAS SALAS
// ==========================================

const rooms = {};


// ==========================================
// GERAR CÓDIGO DA SALA
// ==========================================

function generateRoomCode() {

    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

}



// ==========================================
// CALCULAR VENCEDOR
// ==========================================

function calculateWinner(player1, player2) {


    if(player1 === player2){

        return 0; // empate

    }


    if(

        (player1 === "rock" &&
         player2 === "scissors")

        ||

        (player1 === "paper" &&
         player2 === "rock")

        ||

        (player1 === "scissors" &&
         player2 === "paper")

    ){

        return 1; // jogador 1 venceu

    }


    return 2; // jogador 2 venceu

}



// ==========================================
// CONEXÃO DOS JOGADORES
// ==========================================

io.on("connection", socket => {


    console.log(
        "Novo jogador:",
        socket.id
    );



    // ======================================
    // CRIAR SALA
    // ======================================


    socket.on(
        "createRoom",
        playerName => {


            let roomCode;


            do {

                roomCode =
                generateRoomCode();


            } while(rooms[roomCode]);



            rooms[roomCode] = {


                players:[

                    {

                        id:socket.id,

                        name:
                        playerName || "Jogador",

                        move:null,

                        score:0

                    }

                ]

            };



            socket.join(roomCode);


            socket.room = roomCode;



            socket.emit(
                "roomCreated",
                roomCode
            );


            console.log(
                "Sala criada:",
                roomCode
            );


        }
    );





    // ======================================
    // ENTRAR NA SALA
    // ======================================


    socket.on(
        "joinRoom",
        data => {


            const room =
            rooms[data.room];



            if(!room){


                socket.emit(
                    "errorRoom",
                    "Sala não encontrada."
                );


                return;


            }



            if(room.players.length >= 2){


                socket.emit(
                    "errorRoom",
                    "Sala cheia."
                );


                return;


            }



            room.players.push({

                id:socket.id,

                name:
                data.name || "Jogador",

                move:null,

                score:0

            });



            socket.join(
                data.room
            );


            socket.room =
            data.room;



            io.to(data.room)
            .emit(
                "gameStart",
                {

                    room:data.room,

                    players:
                    room.players

                }
            );


            console.log(
                "Jogador entrou:",
                data.room
            );


        }
    );





    // ======================================
    // JOGADA
    // ======================================


    socket.on(
        "playerMove",
        data => {


            const room =
            rooms[data.room];



            if(!room)
                return;



            const player =
            room.players.find(
                p =>
                p.id === socket.id
            );



            if(!player)
                return;



            player.move =
            data.move;



            // Espera os dois jogadores

            if(
                room.players.length === 2
                &&
                room.players.every(
                    p=>p.move
                )
            ){


                const p1 =
                room.players[0];


                const p2 =
                room.players[1];



                const result =
                calculateWinner(
                    p1.move,
                    p2.move
                );



                if(result === 1){

                    p1.score++;

                }


                if(result === 2){

                    p2.score++;

                }



                io.to(data.room)
                .emit(
                    "roundResult",
                    {


                        result,


                        p1Move:
                        p1.move,


                        p2Move:
                        p2.move,


                        score1:
                        p1.score,


                        score2:
                        p2.score,


                        players:
                        room.players


                    }
                );



                // limpa escolhas

                p1.move=null;

                p2.move=null;


            }


        }
    );





    // ======================================
    // NOVA RODADA
    // ======================================


    socket.on(
        "playAgain",
        roomCode => {


            const room =
            rooms[roomCode];


            if(!room)
                return;



            io.to(roomCode)
            .emit(
                "newRound"
            );


        }
    );





    // ======================================
    // DESCONEXÃO
    // ======================================


    socket.on(
        "disconnect",
        ()=>{


            console.log(
                "Saiu:",
                socket.id
            );



            const roomCode =
            socket.room;



            if(!roomCode)
                return;



            const room =
            rooms[roomCode];



            if(!room)
                return;



            room.players =
            room.players.filter(
                p =>
                p.id !== socket.id
            );



            io.to(roomCode)
            .emit(
                "opponentLeft"
            );



            if(
                room.players.length === 0
            ){

                delete rooms[roomCode];

            }


        }
    );



});




// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT =
process.env.PORT || 3000;


server.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});