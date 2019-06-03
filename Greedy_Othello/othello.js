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

function AlphaBeta(board, depth, alpha, beta, maxPlayer, self, opponent, move) {
    if (depth == 0) {
        // console.log('wtf')
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
            let newBoard = [...board]
            newBoard[possibleMoves[i].y][possibleMoves[i].x] = self

            let node = possibleMoves[i]
            // let ab = AlphaBeta(newBoard, depth-1, alpha, beta, false, self, opponent, node)
            // if (ab > alpha) {
            //     alpha = ab
            //     selectedNode = node
            // }
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
            let newBoard = [...board]
            newBoard[possibleMoves[i].y][possibleMoves[i].x] = opponent

            let node = possibleMoves[i]
            // let ab = AlphaBeta(newBoard, depth-1, alpha, beta, true, self, opponent, node)
            // if (ab < beta) {
            //     beta = ab
            //     selectedNode = node
            // }

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

    let possibleMoves = checkLegalMoves(newBoard, self, opponent)

    let cond = Number.NEGATIVE_INFINITY
    let move = null

    for (let i = 0; i < possibleMoves.length; i++) {
        let tempBoard = [...newBoard]
        tempBoard[possibleMoves[i].y][possibleMoves[i].x] = self

        ab = AlphaBeta(tempBoard, 3, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, false, self, opponent, possibleMoves[i])

        if (ab > cond) {
            move = possibleMoves[i]
        }
    }

    console.log(move)

    return (move.y * 8 + move.x)

    // move = AlphaBeta(newBoard, 3, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true, self, opponent, null)


}

module.exports = othello
