import Head from 'next/head'
import styles from './Home.module.sass'

import Game from './game/[id].js'

export default function Home() {
    return (
        <HomeLayout content={<Game />}/>
    )
}


export function HomeLayout({ content }) {
    return (
        <div className={styles.container}>
            <Head>
                <title>Tic Tac Toe</title>
            </Head>

            <main className={styles.main}>
                {content}
            </main>

            <footer className={styles.footer}>
                <a
                href="https://github.com/davidc360/TicTacToe"
                target="_blank"
                rel="noopener noreferrer"
                >
                {' '}
                <img src="/GitHub-Mark-120px-plus.png" alt="Github Logo" className={styles.logo} />
                </a>
            </footer>
        </div>
    )
}