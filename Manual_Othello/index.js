const io = require('socket.io-client')
const prompt = require('prompt')

prompt.start()

var tileRep = ['_', 'X', 'O'],
    N = 8;

function randInt(a, b){
  return parseInt(Math.floor(Math.random() * (b - a) + b));
}

function ix(row, col){
  console.log(row);
  console.log(col);
  console.log('abcdefgh'.indexOf(col));
  return (row - 1) * N + 'abcdefgh'.indexOf(col);
}

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

function validateHumanPosition(position){
  var validated = position.length === 2;

  if(validated){
    var row = parseInt(position[0]),
        col = position[1].toLowerCase();

    return (1 <= row && row <= N) && ('abcdefgh'.indexOf(col) >= 0);
  }

  return false;
}

var socket = io.connect('http://192.168.1.5:4000'),
    userName = 'Ghof_' + randInt(0, 10000),
    tournamentID = 12;

socket.on('connect',function(){

  // Client has connected
  console.log("Conectado: " + userName);

  // Signing signal
  socket.emit('signin', {
    user_name: userName,
    tournament_id: tournamentID,  // 142857
    user_role: 'player'
  });
});

socket.on('ok_signin', function() {
    console.log('Successfully signed in!')
})

socket.on('ready', function(data){

  // Client is about to move
  console.log("About to move. Board:\n");
  console.log(humanBoard(data.board));
  console.log("\nRequesting move...");

  var movement = '';

  // while(!validateHumanPosition(movement)){
      prompt.get(['move'], function(err, result) {
          console.log(result.move)
          movement = result.move

          socket.emit('play', {
              player_turn_id: data.player_turn_id,
              tournament_id: tournamentID,
              game_id: data.game_id,
              movement: ix(parseInt(movement[0]), movement[1].toLowerCase())
          });
      })
  // }

    // socket.emit('play', {
    //     player_turn_id: data.player_turn_id,
    //     tournament_id: tournamentID,
    //     game_id: data.game_id,
    //     movement: ix(parseInt(movement[0]), movement[1].toLowerCase())
    // });
});

socket.on('finish', function(data){

  // The game has finished
    console.log("Game " + data.game_id + " has finished");

    // Inform my students that there is no rematch attribute
    console.log("Ready to play again!");

    // Start again!

    socket.emit('player_ready', {
        tournament_id: tournamentID,
        game_id: data.game_id,
        player_turn_id: data.player_turn_id
    });

});
