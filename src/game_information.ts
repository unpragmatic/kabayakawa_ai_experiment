import { Card, PlayerEvent, RoundState } from "./state";

export interface GameInformation {
    kabayakawa: Card
    events: PlayerEvent[]
    player_wallets: number[]
    round_pot: number
    starting_player: number
}

export function ExtractGameInformation(round_state: RoundState): GameInformation {
    return {
        kabayakawa: round_state.kabayakawa,
        events: round_state.events,
        player_wallets: round_state.player_wallets,
        round_pot: round_state.pot,
        starting_player: round_state.starting_player
    }
}