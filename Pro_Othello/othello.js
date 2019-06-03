othello = {}

staticWeights = [
    [4, -3, 2, 2, 2, 2, -3, 4],
    [-3, -4, -1, -1, -1, -1, -4, -3],
    [2, -1, 1, 0, 0, 1, -1, 2],
    [2, -1, 0, 1, 1, 0, -1, 2],
    [2, -1, 0, 1, 1, 0, -1, 2],
    [2, -1, 1, 0, 0, 1, -1, 2],
    [-3, -4, -1, -1, -1, -1, -4, -3],
    [4, -3, 2, 2, 2, 2, -3, 4],
]

cornersWeight = 0.3
mobilityWeight = 0.05
stabilityWeight = 0.25
parityWeight = 0.25

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

function calculateParityAndStability(board, self, opponent) {
    let countSelf = 0
    let countOpponent = 0

    let stabilitySelf = 0
    let stabilityOpponent = 0

    let cornersSelf = 0
    let cornersOpponent = 0

    let cornerRiskSelf = 0
    let cornerRiskOpponent = 0

    for (let j = 0; j < 8; j++) {
        for (let i = 0; i < 8; i++) {
            if (board[j][i] === self) {
                countSelf++
                stabilitySelf += staticWeights[j][i]
            } else if (board[j][i] === opponent) {
                countOpponent++
                stabilityOpponent += staticWeights[j][i]
            }
        }
    }

    if (board[0][0] == self) cornersSelf++
    if (board[0][7] == self) cornersSelf++
    if (board[7][0] == self) cornersSelf++
    if (board[7][7] == self) cornersSelf++

    if (board[0][0] == opponent) cornersOpponent++
    if (board[0][7] == opponent) cornersOpponent++
    if (board[7][0] == opponent) cornersOpponent++
    if (board[7][7] == opponent) cornersOpponent++

    if (board[0][1] == self) cornerRiskSelf++
    if (board[1][0] == self) cornerRiskSelf++
    if (board[1][1] == self) cornerRiskSelf++

    if (board[0][6] == self) cornerRiskSelf++
    if (board[1][6] == self) cornerRiskSelf++
    if (board[1][7] == self) cornerRiskSelf++

    if (board[6][0] == self) cornerRiskSelf++
    if (board[6][1] == self) cornerRiskSelf++
    if (board[7][1] == self) cornerRiskSelf++

    if (board[6][6] == self) cornerRiskSelf++
    if (board[6][7] == self) cornerRiskSelf++
    if (board[7][6] == self) cornerRiskSelf++

    if (board[0][1] == opponent) cornerRiskOpponent++
    if (board[1][0] == opponent) cornerRiskOpponent++
    if (board[1][1] == opponent) cornerRiskOpponent++

    if (board[0][6] == opponent) cornerRiskOpponent++
    if (board[1][6] == opponent) cornerRiskOpponent++
    if (board[1][7] == opponent) cornerRiskOpponent++

    if (board[6][0] == opponent) cornerRiskOpponent++
    if (board[6][1] == opponent) cornerRiskOpponent++
    if (board[7][1] == opponent) cornerRiskOpponent++

    if (board[6][6] == opponent) cornerRiskOpponent++
    if (board[6][7] == opponent) cornerRiskOpponent++
    if (board[7][6] == opponent) cornerRiskOpponent++

    let cornerValueSelf = cornersSelf * 3 - cornerRiskSelf * 2
    let cornerValueOpponent = cornersOpponent * 3 - cornerRiskOpponent * 2

    // let cornerValueSelf = cornersSelf
    // let cornerValueOpponent = cornersOpponent

    let coinHeuristic = 100 * ((countSelf - countOpponent) / (countSelf + countOpponent))

    if (cornerValueSelf + cornerValueOpponent != 0) {
        cornerHeuristic = 100 * ((cornerValueSelf - cornerValueOpponent) / (cornerValueSelf + cornerValueOpponent))
    } else {
        cornerHeuristic = 0
    }

    if (stabilitySelf + stabilityOpponent != 0) {
        stabilityHeuristic = 100 * ((stabilitySelf - stabilityOpponent) / (stabilitySelf + stabilityOpponent))
    } else {
        stabilityHeuristic = 0
    }
    // console.log(coinHeuristic)
    // console.log(stabilityHeuristic)
    // console.log(cornerHeuristic)

    return {coinHeuristic: coinHeuristic, stabilityHeuristic: stabilityHeuristic, cornerHeuristic: cornerHeuristic}
}

function checkLegalMoves(board, self, opponent) {
    res = []

    for (let j = 0; j < 8; j++) {
        for (let i = 0; i < 8; i++) {
            if (board[j][i] == 0) {
                let flips = checkFlips(board, self, opponent, i, j)

                if (flips > 0) {
                    let tempBoard = simulateMove(board, i, j, self, opponent)
                    tempBoard[j][i] = self

                    let heuristicsInfo = calculateParityAndStability(tempBoard, self, opponent)
                    let totalHeuristic = (heuristicsInfo.coinHeuristic * parityWeight) + (heuristicsInfo.stabilityHeuristic * stabilityWeight) + (heuristicsInfo.cornerHeuristic * cornersWeight)
                    // let selfCoins = coins.selfCoins
                    // let opponentCoins = coins.opponentCoins

                    // let coinHeuristic = 100 * ((selfCoins - opponentCoins) / (selfCoins + opponent))
                    // console.log(coinHeuristic)

                    res.push({
                        x: i,
                        y: j,
                        heuristic: totalHeuristic,
                        simulatedMove: tempBoard
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
    let copyBoard = []
    for (let j = 0; j < 8; j++) {
        newBoard.push([])
        copyBoard.push([])
        newBoard[j] = [...board[j]]
        copyBoard[j] = [...board[j]]
    }



    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        piece = board[j][i]
        if (piece == opponent) {
            newBoard[j][i] = self
        } else if (piece == self) {
            return newBoard
        } else {
            return copyBoard
        }

        i += dx
        j += dy
    }

    return copyBoard
}

function simulateMove(board, x, y, self, opponent) {
    let newBoard = simulateMoveDirection(board, self, opponent, x, y, 1, 1)
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
        // console.log(move.heuristic)
        return move.heuristic
    }

    let possibleMovesSelf = checkLegalMoves(board, self, opponent)
    let possibleMovesOpponent = checkLegalMoves(board, opponent, self)


    if (maxPlayer) {
        let possibleMoves = possibleMovesSelf
        if (possibleMoves.length == 0) {
            // console.log(move.heuristic)
            return move.heuristic
        }

        // let selectedNode = null
        // console.log(possibleMoves.length)

        for (let i = 0; i < possibleMoves.length; i++) {
            let node = possibleMoves[i]

            // let newBoard = []
            // for (let j = 0; j < 8; j++) {
            //     newBoard.push([])
            //     newBoard[j] = [...board[j]]
            // }
            // newBoard[possibleMoves[i].y][possibleMoves[i].x] = self

            // newBoard = simulateMove(newBoard, possibleMoves[i].x, possibleMoves[i].y, self, opponent)
            let newBoard = node.simulatedMove
            // console.log(newBoard)

            if (possibleMovesSelf.length + possibleMovesOpponent.length != 0) {
                mobilityHeuristic = 100 * ((possibleMovesSelf.length - possibleMovesOpponent.length) / (possibleMovesSelf.length + possibleMovesOpponent.length))
            } else {
                mobilityHeuristic = 0
            }
            // console.log(mobilityHeuristic)

            node.heuristic += mobilityHeuristic * mobilityWeight

            alpha = Math.max(alpha, AlphaBeta(newBoard, depth-1, alpha, beta, false, self, opponent, node))

            if (alpha >= beta) {
                break
            }
        }
        return alpha
    } else {
        let possibleMoves = possibleMovesOpponent
        if (possibleMoves.length == 0) {
            return move.heuristic
        }
        // console.log(possibleMoves.length)

        // let selectedNode = null

        for (let i = 0; i < possibleMoves.length; i++) {
            let node = possibleMoves[i]

            // let newBoard = []
            // for (let j = 0; j < 8; j++) {
            //     newBoard.push([])
            //     newBoard[j] = [...board[j]]
            // }
            //
            // newBoard[possibleMoves[i].y][possibleMo.ves[i].x] = opponent
            // newBoard = simulateMove(newBoard, possibleMoves[i].x, possibleMoves[i].y, opponent, self)

            let newBoard = node.simulatedMove

            if (possibleMovesSelf.length + possibleMovesOpponent.length != 0) {
                mobilityHeuristic = 100 * (( possibleMovesOpponent.length - possibleMovesSelf.length) / (possibleMovesSelf.length + possibleMovesOpponent.length))
            } else {
                mobilityHeuristic = 0
            }

            node.heuristic += mobilityHeuristic * mobilityWeight

            // console.log(node)


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
    // console.log('asdfasdf')
    let newBoard = transformBoard(board)
    // console.log(newBoard)

    let possibleMoves = checkLegalMoves(newBoard, self, opponent)
    let possibleMovesOpponent = checkLegalMoves(newBoard, opponent, self)
    // console.log(possibleMoves[0])

    let cond = Number.NEGATIVE_INFINITY
    let move = null

    for (let i = 0; i < possibleMoves.length; i++) {
        let node = possibleMoves[i]

        tempBoard = node.simulatedMove

        if (possibleMoves.length + possibleMovesOpponent.length != 0) {
            mobilityHeuristic = 100 * (( possibleMovesOpponent.length - possibleMoves.length) / (possibleMoves.length + possibleMovesOpponent.length))
        } else {
            mobilityHeuristic = 0
        }

        node.heuristic += mobilityHeuristic * mobilityWeight
        // console.log(tempBoard)

        ab = AlphaBeta(tempBoard, 5, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, false, self, opponent, node)

        // console.log(ab)
        if (ab > cond) {
            move = possibleMoves[i]
            cond = ab
        }
    }

    // console.log(move)

    return (move.y * 8 + move.x)

    // move = AlphaBeta(newBoard, 3, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true, self, opponent, null)


}

module.exports = othello
