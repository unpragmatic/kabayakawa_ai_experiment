import { GetAndRemoveRandomElementFromSet } from "./utils";

export type Card = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export interface RoundState {
    player_count: number
    player_wallets: number[]
    starting_player: number
    current_player: number
    phase: 'DISCARD' | 'STAKE' | 'END'
    pot: number
    kabayakawa: Card
    deck: Set<Card>
    player_hand: Card[]
    events: PlayerEvent[]
}

export interface GameState {
    player_count: number
    player_wallet: number[]
    max_rounds: number
    round_number: number
    starting_player: number
}

export interface DiscardEvent{
    kind: 'DISCARD'
    player_id: number
    discard: Card
} 

export interface StakeEvent {
    kind: 'STAKE'
    player_id: number
    stake: boolean
}

export type PlayerEvent = DiscardEvent | StakeEvent

export interface GameInformation {
    kabayakawa: Card
    events: PlayerEvent[]
    player_wallets: number[]
    round_pot: number
}

export function CreateRoundState(player_count: number, starting_player: number, pot: number, player_wallet: number[]): RoundState {
    const initial_deck: Set<Card> = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] as Card[]);
    let [kabayakawa, deck] = GetAndRemoveRandomElementFromSet(initial_deck);

    const player_hand: Card[] = []
    for (let i = 0; i < player_count; i++) {
        let random_card;
        [random_card, deck] = GetAndRemoveRandomElementFromSet(deck);
        player_hand.push(random_card);
    }

    return {
        player_count: player_count,
        player_wallets: player_wallet,
        starting_player: starting_player,
        current_player: starting_player,
        phase: 'DISCARD',
        pot: pot,
        kabayakawa: kabayakawa,
        deck: deck,
        player_hand: player_hand,
        events: []
    }
}

export function CreateGameState(player_count: number, max_rounds: number, starting_player: number): GameState {
    const starting_money = 4;
    const player_wallet = []
    for (let i = 0; i < player_count; i++) {
        player_wallet.push(starting_money)
    }

    return {
        player_count: player_count,
        player_wallet: player_wallet,
        max_rounds: max_rounds,
        round_number: 1,
        starting_player: starting_player
    }
}