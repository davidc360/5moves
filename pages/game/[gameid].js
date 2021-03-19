import Game from '../../components/Game'

export default function GameBattle(props) {
    return (
        <Game {...props} />
    )
}

export async function getServerSideProps({ query }) {
    const { gameid } = query

    try {
        const req = await fetch(process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + 'game/' + gameid)
        const res = await req.json()
        // const moves = await req.json()
    
        const data = {
            // moves: String(moves)
            moves: String(res.moves)
        }
    
        return {
            props: { data }
        }
    } catch {
        return {
            props: {
                data: {
                    moves: 'error'
                }
            }
        }
    }
    
}

