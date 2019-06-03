const io = require('socket.io-client')
const othello = require('./othello')

const PORT = 4000
const HOST = '192.168.1.5'
const socket = io.connect(`http://${HOST}:${PORT}`)

var tileRep = ['_', 'X', 'O'],
    N = 8;

username = 'ciborg245'
tid = 12

board = [0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0]

move = othello.getNextMove(board, 1, 2)

function humanBoard(board){

    var result = '    A  B  C  D  E  F  G  H';

    for(var i = 0; i < board.length; i++){
        if(i % N === 0){
            result += '\n\n ' + (parseInt(Math.floor(i / N)) + 1) + ' ';
        }

        result += ' ' + tileRep[board[i]] + ' ';
    }

    return result;
}

socket.on('connect', function() {
    console.log('Connecting...')

    socket.emit('signin', {
        user_name: username,
        tournament_id: tid,
        user_role: 'player'
    })
})

socket.on('ok_signin', function() {
    console.log('Successfully signed in!')
})

socket.on('ready', function(data) {
    var gameID = data.game_id
    var self = data.player_turn_id
    var board = data.board

    // console.log(data.board)
    console.log("About to move. Board:\n");
    // console.log(humanBoard(data.board));
    console.log("\nRequesting move...");

    opponent = self == 1 ? 2 : 1
    move = othello.getNextMove(board, self, opponent)

    socket.emit('play', {
        player_turn_id: data.player_turn_id,
        tournament_id: tid,
        game_id: data.game_id,
        movement: move
    });
})

socket.on('finish', function(data){

  // The game has finished
    console.log("Game " + data.game_id + " has finished");

    // Inform my students that there is no rematch attribute
    console.log("Ready to play again!");

    // Start again!

    socket.emit('player_ready', {
        tournament_id: tid,
        game_id: data.game_id,
        player_turn_id: data.player_turn_id
    });

});
