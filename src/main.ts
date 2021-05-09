import { SimGame } from './game';
import { CreateRandomPlayer } from './players/random_player';
import { ArrayFill, ArrayRange } from './utils';

interface Stats {
    wins: number[]
    draws: number
    starts: number[]
}

function Main() {
    console.log("Start")
    const player_count = 4;
    const stats: Stats = {
        wins: ArrayFill(0, player_count),
        draws: 0,
        starts: ArrayFill(0, player_count)
    }
    const player_controllers = ArrayRange(4).map(
        i => CreateRandomPlayer(i)
    )

    const sims = 100000;
    for (let i = 0; i < sims; i++) {
        const starting_player = Math.floor(Math.random() * player_count);
        const [winner_ids, wallets] = SimGame(player_controllers, starting_player);

        // Adjust stats
        for (const winner_id of winner_ids) {
            stats.wins[winner_id] += 1;
        }
        stats.starts[starting_player] += 1;
        if (winner_ids.length > 1) {
            stats.draws += 1;
        }

        if (i % 10000 === 0) {
            console.log(i)
        }
    }

    console.log("end")
    DisplayStats(stats);
}

function DisplayStats(stats: Stats) {
    const { wins, draws, starts } = stats;

    console.log(`wins: ${wins}, sum: ${wins.reduce((a, b) => a + b)}`);
    console.log(`draws: ${draws}`)
    console.log(`starts: ${starts}, sum: ${starts.reduce((a, b) => a + b)}`);
}

Main();