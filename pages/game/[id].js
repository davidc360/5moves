import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { HomeLayout } from '../index'

import styles from './Game.module.sass'

export default function Game({ data }) {
    const isBattle = data !== undefined
    const [moves, setMoves] = useState([])
    const [gridValues, setGridValues] = useState([...Array(9)])
    const gridValuesRef = useRef([...Array(9)])
    const [movesPicked, setMovesPicked] = useState(false)

    const grids = [...Array(9)].map((_, i) => (
        <div key={i} id={i} onClick={addMove}>
            {gridValues[i] ? MARKS[gridValues[i]] : ''}
        </div>
    ))

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
    const [winner, setWinner] = useState()
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
        if(moves.length<9) setMoves([...moves, e.target.id])
    }
    useEffect(() => {
        if (moves.length === 9) setMovesPicked(true)
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
    const speed = 700
    useEffect(() => {
        let int
        if (movesPicked) {
            for (let i = 0; i < 9; i++) {
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
    }, [movesPicked])

    const GameComponent = (
        <div className={styles.ctn}>
            <div>
                Remaining moves: {9 - moves.length}
                <br/>
                Moves: {moves}
            </div>
            <div>
                {isBattle && "Opponent moves: " + data.moves}
            </div>
            <div className={styles.grid}>
                {grids}
            </div>
        </div>
    )
    return (
        <HomeLayout content={
            GameComponent 
        }/>
    )
}

export async function getServerSideProps({ params }) {
    const req = await fetch(`https://tictactoe-spd.herokuapp.com/`)
    const moves = await req.json()

    const data = {
        moves: String(moves)
    }

    return {
        props: { data }
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