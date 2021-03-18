import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import HomeLayout from './HomeLayout.js'

import styles from './Game.module.sass'
import axios from "axios"

const MAX_MOVES = 5

export default function Game({ data }) {
    const router = useRouter()
    const isBattle = data !== undefined
    const [winner, setWinner] = useState()
    const [moves, setMoves] = useState([])
    const [gridValues, setGridValues] = useState([...Array(9)])
    const gridValuesRef = useRef([...Array(9)])
    const [movesPicked, setMovesPicked] = useState(false)

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
            <div key={i} id={i} onClick={addMove} className={`${styles.square} ${winner&&styles.dim}`}>
                {movesPicked && isBattle ?
                    (gridValues[i] ? MARKS[gridValues[i]] : '') :
                    (
                        // create an array of length
                        // of (the number of occurrences of i in moves), in other words how many of times did the player pick this square
                        // fill array with circle icons
                        [...Array(moves.filter(m => m == i).length)].map((_, _i) => <div className={styles.squareMarkWrap} key={_i}>{isBattle ? <CircleMark /> : <XMark />}</div>)
                    )
                    // show player's moves as numbers
                    // ( clickOrder[i] ? 
                    //         clickOrder[i].split('').map(num => <div>{num}</div>)
                    //         : ''
                    // )
                    // show player's moves as icons
                }
                {/* {console.log(moves, (moves.filter(m => m == i)))} */}
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
                    winner = row[0]
                }
                
                // check if [i] column is the same
                const column = matrix.map(row_ => row_[i])
                if (containsSame(column)) {
                    winner = column[0] 
                }
            }
        )

        // check for diagonal lines
        // first there has to be a center mark
        const centerMark = matrix[1][1]
        if (centerMark) {
            // check if top left and bottom right is same mark
            if (containsSame([matrix[0][0], centerMark, matrix[2][2]])) {
                winner = centerMark
            } else if (containsSame([matrix[0][2], centerMark, matrix[2][0]])) {
                // else check if top right is same as bottom left
                winner = centerMark
            }
        }

        return winner
    }
    // find winner
    useEffect(() => {
        // use a temp winner variable to avoid waiting for
        // "setWinner" to take effect in changing the state
        // and clear timeouts immediately
        let winner_ = findWinner()
        if (winner_) timeouts.current.forEach(timeout => clearTimeout(timeout))
        setWinner(winner_)
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
        if (gridValuesRef.current[move] === mark) {
            gridValuesRef.current[move] = null
            setGridValues([...gridValuesRef.current])
        }
        gridValuesRef.current[move] = mark
        setGridValues([...gridValuesRef.current])
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
                        addMoveToGrid(data.moves[i], 'X')
    
                        // set self move
                        timeouts.current.push(setTimeout(() => {
                                addMoveToGrid(moves[i], 'O')
                        }, speed))
                    }, i*speed*2))
                }
            }
            return () => clearInterval(int)
        }
    }, [movesPicked])

    function createLink(e) {
        axios.post(process.env.BACKEND_ENDPOINT + 'game', {
            moves: moves.join(''),
            name: 'David'
        })
        .catch(err => console.log(err))
    }

    function routeToHome(e) {
        router.push('/')
    }

    return (
        <HomeLayout content={
            isBattle && data.moves === 'error' ?
                (<>
                    <div>Game not found.</div>
                    <div className={styles.button} onClick={routeToHome}>Create Game</div>
                 </>
                )
                : (
                <div className={styles.ctn}>
                    {
                        !isBattle &&
                        <div className={styles.prompt}>Pick {MAX_MOVES} moves to create a game</div>
                    }
                    <div>
                        Remaining moves: {MAX_MOVES - moves.length}
                        <br/>
                    </div>
                    { isBattle &&
                        <div className={styles.players}>
                            <div>Opponent: <XMark /></div>
                            <div><CircleMark /> You</div>
                        </div>
                    }
                    <br/>
                    <div className={styles.grid}>
                        {grids}
                    </div>
                    {/* <div className={styles.createLink}>{movesPicked && !isBattle ? 'Create Link' : ''}</div> */}
                    {(movesPicked && !isBattle) && <div className={`${styles.createLink} ${styles.button}`} onClick={createLink}>Create Link</div>}
                    <div className={styles.result}>{winner ? winner==='X'?'you lost!':'You won!':''}</div>
                </div>
            )
        }/>
    )
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