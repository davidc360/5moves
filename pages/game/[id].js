import { useRouter } from 'next/router'
import { HomeLayout } from '../index'

import styles from './Game.module.sass'

export default function Game({ data }) {
    const grids = [...Array(9)].map(_ => <div>X</div>)
    const GameComponent = (
        <div className={styles.ctn}>
            {grids}
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