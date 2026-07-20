const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ================================
// SERVIR O CLIENT
// ================================

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

// ================================
// SALAS
// ================================

const rooms = {};

// ================================
// GERAR CÓDIGO
// ================================

function generateRoomCode() {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );

    }

    if (rooms[code]) {
        return generateRoomCode();
    }

    return code;

}

// ================================
// VERIFICAR VENCEDOR
// ================================

function winner(p1, p2) {

    if (p1 === p2)
        return 0;

    if (
        (p1 === "rock" && p2 === "scissors") ||
        (p1 === "paper" && p2 === "rock") ||
        (p1 === "scissors" && p2 === "paper")
    ) {

        return 1;

    }

    return 2;

}

// ================================
// SOCKET
// ================================

io.on("connection", socket => {

    console.log("Conectado:", socket.id);

    // ============================
    // CRIAR SALA
    // ============================

    socket.on("createRoom", name => {

        const room = generateRoomCode();

        rooms[room] = {

            players: [

                {

                    id: socket.id,
                    name

                }

            ],

            score1: 0,
            score2: 0,

            move1: null,
            move2: null

        };

        socket.join(room);

        socket.emit(
            "roomCreated",
            room
        );

    });

    // ============================
    // ENTRAR NA SALA
    // ============================

    socket.on("joinRoom", data => {

        const room = data.room;

        if (!rooms[room]) {

            socket.emit(
                "errorRoom",
                "Sala não encontrada."
            );

            return;

        }

        if (rooms[room].players.length >= 2) {

            socket.emit(
                "errorRoom",
                "Sala cheia."
            );

            return;

        }

        rooms[room].players.push({

            id: socket.id,

            name: data.name

        });

        socket.join(room);

        io.to(room).emit(

            "gameStart",

            {

                room,

                players: rooms[room].players

            }

        );

    });

    // ============================
    // JOGADA
    // ============================

    socket.on("playerMove", data => {

        const room = rooms[data.room];

        if (!room)
            return;

        const player =
            room.players.findIndex(
                p => p.id === socket.id
            );

        if (player === 0) {

            room.move1 = data.move;

        }

        else {

            room.move2 = data.move;

        }

        if (!room.move1 || !room.move2)
            return;

        const result = winner(

            room.move1,

            room.move2

        );

        if (result === 1)
            room.score1++;

        if (result === 2)
            room.score2++;

        io.to(data.room).emit(

            "roundResult",

            {

                p1Move: room.move1,

                p2Move: room.move2,

                score1: room.score1,

                score2: room.score2,

                result

            }

        );

    });

    // ============================
    // NOVA RODADA
    // ============================

    socket.on("playAgain", roomCode => {

        const room = rooms[roomCode];

        if (!room)
            return;

        room.move1 = null;

        room.move2 = null;

        io.to(roomCode).emit(
            "newRound"
        );

    });

    // ============================
    // DESCONECTOU
    // ============================

    socket.on("disconnect", () => {

        for (const room in rooms) {

            const index =
                rooms[room]
                    .players
                    .findIndex(

                        p => p.id === socket.id

                    );

            if (index !== -1) {

                io.to(room).emit(
                    "opponentLeft"
                );

                delete rooms[room];

                break;

            }

        }

    });

});

// ================================

server.listen(PORT, () => {

    console.log("");

    console.log("===============================");

    console.log(" Pedra Papel Tesoura Online");

    console.log("===============================");

    console.log("");

    console.log(`Servidor rodando na porta ${PORT}`);

    console.log(`http://localhost:${PORT}`);

    console.log("");

});