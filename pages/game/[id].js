import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { HomeLayout } from '../index'

import styles from './Game.module.sass'

export default function Game({ data }) {
    const [moves, setMoves] = useState([])
    const [gridValues, setGridValues] = useState([...Array(9)])
    const gridValuesRef = useRef([...Array(9)])
    const [movesPicked, setMovesPicked] = useState(false)

    const MARKS = {
        O: <CircleMark />,
        X: <XMark />
    }

    const grids = [...Array(9)].map((_, i) => (
        <div key={i} id={i} onClick={addMove}>
            {gridValues[i] ? MARKS[gridValues[i]] : ''}
        </div>
    ))

    function addMove(e) {
        if(moves.length<9)
            setMoves([...moves, e.target.id])

        // setMoves('678345012'.split(''))
    }
    useEffect(() => {
        if (moves.length === 9) setMovesPicked(true)
    })

    function addMoveToGrid(move, mark) {
        if (gridValuesRef.current[move] === mark) {
            gridValuesRef.current[move] = null
            setGridValues([...gridValuesRef.current])
            gridValuesRef.current[move] = mark
            setGridValues([...gridValuesRef.current]) 
        } else {
            gridValuesRef.current[move] = mark
            setGridValues([...gridValuesRef.current])
        }
    }
    
    const speed = 1000
    useEffect(() => {
        if (movesPicked) {
            for (let i = 0; i < 9; i++) {
                setTimeout(() => {
                    // set opponent's move
                    addMoveToGrid(data.moves[i], 'X')

                    // set self move
                    setTimeout(() => {
                            addMoveToGrid(moves[i], 'O')
                    }, speed)

                }, i*speed*2)
            }
        }
    }, [movesPicked])

    const GameComponent = (
        <div className={styles.ctn}>
            <div>
                Remaining moves: {9 - moves.length}
                <br/>
                Moves: {moves}
            </div>
            <div>
                Opponent moves: {data.moves}
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
    const req = await fetch(`http://localhost:3000/${params.id}.json`)
    const data = await req.json()

    return {
        props: { data: data }
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
        <circle className={styles.circle} cx="50%" cy="50%" r="10" stroke-dasharray="360">
            <animate attributeName="stroke-dashoffset" values="360;0" dur="3s" repeatCount="forward"></animate>
        </circle>
    </svg>
)