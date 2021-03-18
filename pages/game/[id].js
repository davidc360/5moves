import Game from '../../components/Game'

export default function GameBattle(props) {
    return (
        <Game {...props} />
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

