othello = {}

function transformBoard(board) {
    newBoard = []

    for (let i = 0; i < board.length; i++) {
        if (i % 8 == 0) {
            newBoard.push([])
        }
        newBoard[Math.trunc(i/8)].push(board[i])
    }

    return newBoard
}

function checkFlipDirection(board, self, opponent, x, y, dx, dy) {
    let flips = 0

    let i = x + dx
    let j = y + dy

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        piece = board[j][i]
        if (piece == opponent) {
            flips += 1
        } else if (piece == self) {
            return flips
        } else {
            return 0
        }

        i += dx
        j += dy
    }
    return 0
}

function checkFlips(board, self, opponent, x, y) {
    return checkFlipDirection(board, self, opponent, x, y, 1, 1) +
        checkFlipDirection(board, self, opponent, x, y, 0, 1) +
        checkFlipDirection(board, self, opponent, x, y, -1, 1) +
        checkFlipDirection(board, self, opponent, x, y, -1, 0) +
        checkFlipDirection(board, self, opponent, x, y, -1, -1) +
        checkFlipDirection(board, self, opponent, x, y, 0, -1) +
        checkFlipDirection(board, self, opponent, x, y, 1, -1) +
        checkFlipDirection(board, self, opponent, x, y, 1, 0)
}

function checkLegalMoves(board, self, opponent) {
    res = []
    for (let j = 0; j < 8; j++) {
        for (let i = 0; i < 8; i++) {
            if (board[j][i] == 0) {
                let flips = checkFlips(board, self, opponent, i, j)

                if (flips > 0) {
                    res.push({
                        x: i,
                        y: j,
                        heuristic: flips
                    })
                }
            }
        }
    }

    return res
}

function simulateMoveDirection(board, self, opponent, x, y, dx, dy) {
    let i = x + dx
    let j = y + dy

    let newBoard = []
    for (let j = 0; j < 8; j++) {
        newBoard.push([])
        newBoard[j] = [...board[j]]
    }

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        piece = board[j][i]
        if (piece == opponent) {
            newBoard[j][i] = self
        } else if (piece == self) {
            return newBoard
        } else {
            return board
        }

        i += dx
        j += dy
    }

    return board
}

function simulateMove(board, x, y, self, opponent) {
    let newBoard = board
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, 1, 1)
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, 0, 1)
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, -1, 1)
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, -1, 0)
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, -1, -1)
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, 0, -1)
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, 1, -1)
    newBoard = simulateMoveDirection(newBoard, self, opponent, x, y, 1, 0)

    return newBoard
}

function AlphaBeta(board, depth, alpha, beta, maxPlayer, self, opponent, move) {
    if (depth == 0) {
        return move.heuristic
    }
    if (maxPlayer) {
        let possibleMoves = checkLegalMoves(board, self, opponent)
        if (possibleMoves.length == 0) {
            return move.heuristic
        }

        let selectedNode = null
        // console.log(possibleMoves.length)

        for (let i = 0; i < possibleMoves.length; i++) {
            let newBoard = []
            for (let j = 0; j < 8; j++) {
                newBoard.push([])
                newBoard[j] = [...board[j]]
            }
            newBoard[possibleMoves[i].y][possibleMoves[i].x] = self
            newBoard = simulateMove(newBoard, possibleMoves[i].x, possibleMoves[i].y, self, opponent)

            let node = possibleMoves[i]

            alpha = Math.max(alpha, AlphaBeta(newBoard, depth-1, alpha, beta, false, self, opponent, node))

            if (alpha >= beta) {
                break
            }
        }
        return alpha
    } else {
        let possibleMoves = checkLegalMoves(board, opponent, self)
        if (possibleMoves.length == 0) {
            return move.heuristic
        }
        // console.log(possibleMoves.length)

        let selectedNode = null

        for (let i = 0; i < possibleMoves.length; i++) {
            let newBoard = []
            for (let j = 0; j < 8; j++) {
                newBoard.push([])
                newBoard[j] = [...board[j]]
            }

            newBoard[possibleMoves[i].y][possibleMoves[i].x] = opponent
            newBoard = simulateMove(newBoard, possibleMoves[i].x, possibleMoves[i].y, opponent, self)

            let node = possibleMoves[i]

            beta = Math.min(beta, AlphaBeta(newBoard, depth-1, alpha, beta, true, self, opponent, node))

            if (beta <= alpha) {
                break
            }
        }
        return beta
    }
}

othello.getGreedyMove = function(board, self, opponent) {
    newBoard = transformBoard(board)
    // console.log(newBoard)

    possibleMoves = checkLegalMoves(newBoard, self, opponent)

    move = possibleMoves[0]

    for (let i = 1; i < possibleMoves.length; i++) {
        if (possibleMoves[i].heuristic > move.heuristic) {
            move = possibleMoves[i]
        }
    }

    return (move.y * 8 + move.x)

    // console.log(possibleMoves)
}

othello.getNextMove = function(board, self, opponent) {
    let newBoard = transformBoard(board)
    // console.log(newBoard)

    let possibleMoves = checkLegalMoves(newBoard, self, opponent)

    let cond = Number.NEGATIVE_INFINITY
    let move = null

    for (let i = 0; i < possibleMoves.length; i++) {
        let tempBoard = []
        for (let j = 0; j < 8; j++) {
            tempBoard.push([])
            tempBoard[j] = [...newBoard[j]]
        }
        // console.log(tempBoard)
        tempBoard[possibleMoves[i].y][possibleMoves[i].x] = self
        // console.log(tempBoard)
        tempBoard = simulateMove(tempBoard, possibleMoves[i].x, possibleMoves[i].y, self, opponent)
        // console.log(tempBoard)
        // console.log(newBoard)
        // console.log(tempBoard)

        ab = AlphaBeta(tempBoard, 6, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, false, self, opponent, possibleMoves[i])
        // console.log(ab)
        if (ab > cond) {
            move = possibleMoves[i]
            cond = ab
        }
    }

    console.log(move)

    return (move.y * 8 + move.x)

    // move = AlphaBeta(newBoard, 3, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true, self, opponent, null)


}

module.exports = othello
