import { PlayerController } from "./players/player_controller";
import { CreateGameState, CreateRoundState, GameInformation, StakeEvent } from "./state";
import { GetAndRemoveRandomElementFromSet } from "./utils";

export function SimGame(player_count: number, player_controllers: PlayerController[], starting_player: number): [winner_ids: number[], wallets: number[]] {
    const max_rounds = 7;
    const game_state = CreateGameState(player_count, max_rounds, starting_player);

    while (game_state.round_number <= game_state.max_rounds) {
        const [winner, wallet_delta] = SimRound(
            game_state.player_count,
            game_state.starting_player,
            game_state.round_number === game_state.max_rounds ? 2 : 1,
            Array.from(game_state.player_wallet),
            player_controllers
        );

        game_state.starting_player = winner === -1 ? (game_state.starting_player + 1) % game_state.player_count : winner
        for (let i = 0; i < wallet_delta.length; i++) {
            game_state.player_wallet[i] += wallet_delta[i];
        }
        game_state.round_number += 1;
    }

    const max_wallet = Math.max(...game_state.player_wallet)
    const winner_ids = [];
    for (let i = 0; i < game_state.player_count; i++) {
        if (game_state.player_wallet[i] === max_wallet) {
            winner_ids.push(i);
        }
    }

    return [winner_ids, game_state.player_wallet];
}

export function SimRound(player_count: number, starting_player: number, pot: number, player_wallet: number[], player_controllers: PlayerController[]): [winner: number, wallet_delta: number[]] {
    const round_state = CreateRoundState(player_count, starting_player, pot, player_wallet);

    while (round_state.phase !== 'END') {
        if (round_state.phase === 'DISCARD') {
            // Collecting relevant player information
            const current_player = round_state.current_player;
            const current_hand = round_state.player_hand[current_player];
            const game_information: GameInformation = {
                kabayakawa: round_state.kabayakawa,
                events: round_state.events,
                player_wallets: round_state.player_wallets,
                round_pot: round_state.pot
            }

            // Turn execution
            const player_controller = player_controllers[current_player];
            const [randomCard, newDeck] = GetAndRemoveRandomElementFromSet(round_state.deck);
            const [newHand, discard] = player_controller.DiscardHandler(current_hand, randomCard, game_information)

            // Turn validation
            if (newHand * discard !== current_hand * randomCard) {
                throw `Hand: ${newHand}, and discard: ${discard} are not from [${current_hand}, ${randomCard}].`
            }

            // Applying state changes
            round_state.player_hand[current_player] = newHand;
            round_state.deck = newDeck;
            round_state.events.push({
                kind: 'DISCARD',
                player_id: current_player,
                discard: discard
            })
            round_state.current_player = (round_state.current_player + 1) % round_state.player_count;
            if (round_state.current_player === starting_player) {
                round_state.phase = 'STAKE';
            }
        } else if (round_state.phase === 'STAKE') {
            // Collecting relevant player information
            const current_player = round_state.current_player;
            const current_player_wallet = round_state.player_wallets[current_player];
            const current_player_hand = round_state.player_hand[current_player];
            const game_information: GameInformation = {
                kabayakawa: round_state.kabayakawa,
                events: round_state.events,
                player_wallets: round_state.player_wallets,
                round_pot: round_state.pot
            }

            // Turn execution   
            const player_controller = player_controllers[current_player];
            const stake = player_controller.StakeHandler(current_player_hand, game_information);

            // Validate execution
            if (stake && pot > current_player_wallet) {
                throw `Player ${current_player} does not have sufficient balance to stake.`
            }

            // Applying state changes
            round_state.events.push({
                kind: 'STAKE',
                player_id: current_player,
                stake: stake
            })
            round_state.current_player = (round_state.current_player + 1) % round_state.player_count;
            if (round_state.current_player === round_state.starting_player) {
                round_state.phase = 'END';
            }
        }
    }


    // Calculate winner and wallet deltas
    // Handle edge case with no stakes
    const number_of_stakers = round_state.events.filter(e => e.kind === 'STAKE' && e.stake).length;
    if (number_of_stakers === 0) {
        const wallet_deltas = []
        for (let i = 0; i < round_state.player_count; i++) {
            wallet_deltas.push(0);
        }
        return [-1, wallet_deltas]
    }

    const total_pot = round_state.events
        .reduce((total_pot, e) => total_pot += e.kind === 'STAKE' && e.stake ? round_state.pot : 0, round_state.pot);
    const [min_player_id, min_player_hand] = round_state.events
        .filter(e => e.kind === 'STAKE' && e.stake)
        .map(e => [e.player_id, round_state.player_hand[e.player_id]])
        .reduce(([min_player_id, min_player_hand], [player_id, player_hand]) => {
            return player_hand < min_player_hand ? [player_id, player_hand] : [min_player_id, min_player_hand]
        })
    const [max_player_id, max_player_hand] = round_state.events
        .filter(e => e.kind === 'STAKE' && e.stake)
        .map(e => [e.player_id, round_state.player_hand[e.player_id]])
        .reduce(([max_player_id, max_player_hand], [player_id, player_hand]) => {
            return player_hand > max_player_hand ? [player_id, player_hand] : [max_player_id, max_player_hand]
        })
    const min_player_hand_and_kabayakawa = min_player_hand + round_state.kabayakawa;
    // If it's a draw then the player who moves first wins.
    let winner_id;
    if (min_player_hand_and_kabayakawa == max_player_hand) {
        const turn_number = (player_id: number) => player_id + round_state.player_count - starting_player % round_state.player_count;
        winner_id = turn_number(min_player_id) < turn_number(max_player_id) ? min_player_id : max_player_id;
    } else {
        winner_id = max_player_hand < min_player_hand_and_kabayakawa ? min_player_id : max_player_id;
    }

    const wallet_deltas = []
    for (let i = 0; i < round_state.player_count; i++) {
        const stake_event = round_state.events.filter(e => e.kind === 'STAKE' && e.player_id === i)[0] as StakeEvent
        let delta;
        if (stake_event.stake) {
            delta = i === winner_id ? total_pot : -round_state.pot
        } else {
            delta = 0;
        }
        wallet_deltas.push(delta)
    }
    return [winner_id, wallet_deltas]
}
