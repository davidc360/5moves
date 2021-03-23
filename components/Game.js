import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import HomeLayout from './HomeLayout.js'

import styles from './Game.module.sass'
import axios from "axios"

const MAX_MOVES = 5

export default function Game({ data }) {
    const router = useRouter()
    const [isBattle, setIsBattle] = useState(data !== undefined)
    const [oppMoves, setOppMoves] = useState(data?.moves)
    const [oppName, setOppName] = useState(data?.name)
    
    const [winner, setWinner] = useState()
    const [winnerCoordinates, setWinnerCoordinates] = useState([])
    
    const [moves, setMoves] = useState([])
    const [movesPicked, setMovesPicked] = useState(false)

    const [gridValues, setGridValues] = useState([...Array(9)])
    const gridValuesRef = useRef([...Array(9)])
    const movesThatDontCountedRef = useRef([...Array(9)])
    const [movesThatDontCount, setMovesThatDontCount] = useState([])
 
    function reset() {
        setWinner()
        setWinnerCoordinates([])
        setMoves([])
        setMovesPicked(false)
        timeouts.current = []
        gridValuesRef.current = [...Array(9)]
        setGridValues([...Array(9)])
        movesThatDontCountedRef.current = []
        setMovesThatDontCount([])
    }
    // show player's moves as numbers
    // const [clickOrder, setClickOrder] = useState({})
    // useEffect(() => {
    //     moves.forEach((move, i) => {
    //         const newOrders = { ...clickOrder }
    //         newOrders[move] = newOrders[move] ? newOrders[move] + String(i + 1) : String(i + 1)
    //         setClickOrder(newOrders)
    //     })
    // }, [moves])

    const grids = [...Array(9)].map((_, i) => {
        // map each square to the order they were clicked
        // stored as a single number
        // i.e., {6: 12} meaning it was clicked first & second time
        return (
            <div key={i} id={i} onClick={addMove} className={`${isBattle? styles.squareBattle:styles.squarePick} ${(winner&&winner!=='Draw')?styles.dim:''} ${winnerCoordinates.includes(i)?styles.blackStroke:''}`}>
                {movesPicked && isBattle ?
                    (gridValues[i] ? [MARKS[gridValues[i]], (movesThatDontCount[i] === 'X' ? <div className={styles.invalidMove}><XMark /></div> : movesThatDontCount[i] === 'O' ? <div className={styles.invalidMove}><CircleMark /></div> : null)] : '') :
                    (
                        // create an array of length
                        // of (the number of occurrences of i in moves), in other words how many of times did the player pick this square
                        // fill array with circle icons
                        [...Array(moves.filter(m => m == i).length)].map((_, _i) => <div className={styles.squareMarkWrap} key={_i}>{isBattle ? <CircleMark /> : <XMark />}</div>)
                        .concat(movesThatDontCount[i] === 'X' ? <XMark /> : movesThatDontCount[i] === 'O' ? <CircleMark /> : null)
                    )
                    // show player's moves as numbers
                    // ( clickOrder[i] ? 
                    //         clickOrder[i].split('').map(num => <div>{num}</div>)
                    //         : ''
                    // )
                    // show player's moves as icons
                }
            </div>
        )
    })

    function findWinner(grid=gridValues) {
        // transform grid into 3 rows
        const matrix = [gridValues.slice(0,3), gridValues.slice(3,6), gridValues.slice(6)]

        // check for connecting horizontal and vertical lines
        let winner
        matrix.forEach(
            (row, i) => {
                // check if the whole row is same, which means a line
                if (containsSame(row)) {
                    winner = [row[0], getCoordinates({row: i})]
                }
                
                // check if [i] column is the same
                const column = matrix.map(row_ => row_[i])
                if (containsSame(column)) {
                    winner = [column[0] , getCoordinates({column: i})]
                }
            }
        )

        // check for diagonal lines
        // first there has to be a center mark
        const centerMark = matrix[1][1]
        if (centerMark) {
            // check if top left and bottom right is same mark
            if (containsSame([matrix[0][0], centerMark, matrix[2][2]])) {
                winner = [centerMark, getCoordinates({diagonalStart: 0})]
            } else if (containsSame([matrix[0][2], centerMark, matrix[2][0]])) {
                // else check if top right is same as bottom left
                winner = [centerMark, getCoordinates({diagonalStart: 2})]
            }
        }

        return winner
    }
    // find winner
    useEffect(() => {
        // use a temp winner variable to avoid waiting for
        // "setWinner" to take effect in changing the state
        // and clear timeouts immediately
        const winner_data = findWinner()
        if (winner_data) {
            timeouts.current.forEach(timeout => clearTimeout(timeout))
            setWinner(winner_data[0])
            setWinnerCoordinates(winner_data[1])
        }
        
    }, [gridValues])

    function containsSame(arr) {
        if (arr[0] === undefined || arr[0] === null) return false
        return arr.every(v => v === arr[0]) 
    }

    function addMove(e) {
        if(moves.length<MAX_MOVES) setMoves([...moves, e.target.id])
    }
    useEffect(() => {
        if (moves.length === MAX_MOVES) setMovesPicked(true)
    })

    
    function addMoveToGrid(move, mark) {
        // if (gridValuesRef.current[move] === mark) {
        //     gridValuesRef.current[move] = null
        //     setGridValues([...gridValuesRef.current])
        // }
        // gridValuesRef.current[move] = mark
        // setGridValues([...gridValuesRef.current])
        if (gridValuesRef.current[move] === undefined) {
            gridValuesRef.current[move] = mark
            setGridValues([...gridValuesRef.current])
        } else {
            movesThatDontCountedRef.current[move] = mark
            setMovesThatDontCount([...movesThatDontCountedRef.current])
        }
    }
    
    const timeouts = useRef([])
    // how long each move takes
    const speed = 1000
    useEffect(() => {
        if (isBattle) {
            let int
            if (movesPicked) {
                for (let i = 0; i < MAX_MOVES; i++) {
                    timeouts.current.push(setTimeout(() => {
                        // set opponent's move
                        addMoveToGrid(oppMoves[i], 'X')
                        // addMove(oppMoves[i])
                        
                        // set self move
                        timeouts.current.push(setTimeout(() => {
                            // addMove(oppMoves[i])
                            addMoveToGrid(moves[i], 'O')
                        }, speed))

                        if (i === MAX_MOVES - 1) {
                            timeouts.current.push(setTimeout(() => {
                                setWinner('Draw')
                            }, speed))
                        }
                    }, i*speed*2))
                }
            }
            return () => clearInterval(int)
        }
    }, [movesPicked])

    const [linkCreated, setLinkCreated] = useState(false)
    const nameInputRef = useRef()
    function createLink(e) {
        if (!linkCreated) {
            setLinkCreated(true)
            let num_dots = 0
            e.target.textContent = 'Creating link'
            const loadingDotsInt = setInterval(() => {
                num_dots = (num_dots+1)%5 
                e.target.textContent = 'Creating link' + '.'.repeat(num_dots)
            }, 300)
            axios.post(process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + 'game', {
                moves: moves.join(''),
                name: nameInputRef.current.value
            })
                .then(res => {
                    // stop the loading dots
                    clearInterval(loadingDotsInt)
                    const link = process.env.NEXT_PUBLIC_DEPLOYMENT_LINK + 'game/' + res.data
                    nameInputRef.current.value = link
                    nameInputRef.current.select()
                    document.execCommand('copy')
                    e.target.textContent = 'Copied!'
                    setTimeout(() => {
                        e.target.textContent = 'Copy'
                    }, 2000)
                })
                .catch(err => {
                    console.log(err)
                    clearInterval(loadingDotsInt)
                    e.target.textContent = 'Error, try again'
                })
        } else {
            if (e.target.textContent === 'Copy') {
                nameInputRef.current.select()
                document.execCommand('copy') 
                e.target.textContent = 'Copied!'
                setTimeout(() => {
                    e.target.textContent = 'Copy'
                }, 1000)
            }
        }
    }

    function routeToHome(e) {
        router.push('/')
    }

    function playNow(e) {
        const tempMoves = moves
        reset()
        setOppName(nameInputRef.current.value)
        setIsBattle(true)
        setOppMoves(tempMoves)
    }

    return (
        <HomeLayout content={
            // display error is game isn't found on database
            isBattle && oppMoves === 'error' ?
                (<>
                    <div>Game not found.</div>
                    <div className={styles.button} onClick={routeToHome}>Create Game</div>
                 </>
                )
                : (
            // main game
                <div className={styles.ctn}>
                    <div className={isBattle && movesPicked ? styles.hide : ''}>
                    <div className={styles.prompt}>Pick {MAX_MOVES} moves to {isBattle ? 'begin the' : 'create a'} game</div>
                    <div className={styles.tip}>
                        { isBattle ?
                                <span><strong>{oppName ? oppName : 'Opponent'}</strong> has picked their moves.</span>
                                : 'Tip: you can pick the same square more than once.'
                            }
                    </div>
                    <div>
                        Remaining moves: {MAX_MOVES - moves.length}
                        {/* {movesPicked ? '' : 'Remaining moves: ' + (MAX_MOVES - moves.length)} */}
                        <br/>
                    </div>
                    </div>
                    { isBattle &&
                        <div className={styles.players}>
                            <div>{oppName ? oppName : 'Opponent'}: <XMark /></div>
                            <div><CircleMark /> You</div>
                        </div>
                    }
                    <br/>
                    <div className={styles.grid}>
                        {grids}
                    </div>
                    {/* <div className={styles.createLink}>{movesPicked && !isBattle ? 'Create Link' : ''}</div> */}
                    {movesPicked && !isBattle && (
                        <>
                        <div className={`${styles.createLinkCtn} ${styles.slideUp}`}>
                                <input className={`${styles.name}`} ref={nameInputRef} type='text' maxLength={10} placeholder='name (optional)' readOnly={linkCreated}></input>
                            <div className={`${styles.createLink} ${styles.button}`} onClick={createLink}>Create & Copy Link</div>
                        </div>
                        <br/>
                        <div className={`${styles.button} ${styles.playNow} ${styles.slideUp}`} onClick={playNow}>Play Now</div>
                        </>
                    )}
                        {isBattle && winner && (
                            <>
                                <div className={styles.result}>
                                    {winner === 'X' ? 'You lost!' : winner === 'O' ? 'You won!' : 'Draw!'}
                                    <div className={styles.button} onClick={reset}>Try Again</div>
                                </div>
                            </>
                        )}
                </div>
            )
        }/>
    )
}

function getCoordinates({ row, column, diagonalStart }) {
    if (row !== undefined) {
        return [0, 1, 2].map(x => x+3*row)
    } else if (column !== undefined) {
        return [0, 3, 6].map(x => x+column)
    } else if (diagonalStart !== undefined) {
        return diagonalStart == 0 ? [0, 4, 8] : [2, 4, 6]
    }
}

const XMark = () => (
    <svg className={styles.mark} viewBox="0 0 52 52">
        <path className={styles.x_stroke1} d="M16 16 36 36" />
        <path className={styles.x_stroke2} d="M36 16 16 36" />
    </svg>
)

const CircleMark = () => (
    <svg className={styles.mark} viewBox="0 0 52 52">
        <circle className={styles.circle} cx="50%" cy="50%" r="10" strokeDasharray="360">
            <animate attributeName="stroke-dashoffset" values="360;0" dur="2.5s" repeatCount="forward"></animate>
        </circle>
    </svg>
)

const MARKS = {
    O: <CircleMark />,
    X: <XMark />
}