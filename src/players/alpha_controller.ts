import { SimRound, SimRoundState } from "../game";
import { GameInformation } from "../game_information";
import { Card, CreateDeck, DiscardEvent, PlayerEvent, RoundState, RoundStatePhase } from "../state";
import { ArrayRange, GetAndRemoveRandomElementFromSet } from "../utils";
import { PlayerController, DiscardHandler, StakeHandler } from "./player_controller";
import { CreateRandomPlayer } from "./random_player";

function MinCard(left: Card, right: Card): Card {
    return left < right ? left : right;
}

function OtherCard(left: Card, right: Card, card: Card): Card {
    return (left * right) / card as Card;
}

function SortCard(left: Card, right: Card): [lower: Card, higher: Card] {
    return left < right ? [left, right] : [right, left];
}

export function Sim(info: GameInformation, player_id: number, keep: Card, discard: Card): number {
    let remaining_deck = CreateDeck();
    remaining_deck.delete(keep);
    remaining_deck.delete(discard);
    const discard_events = info.events
        .filter(e => e.kind === 'DISCARD') as DiscardEvent[]
    const discarded_cards = discard_events
        .map(e => e.discard);

    for (const discarded_card of discarded_cards) {
        remaining_deck.delete(discarded_card);
    }
    const player_hand: Card[] = []
    for (let j = 0; j < info.player_count; j++) {
        if (j === player_id) {
            player_hand.push(keep);
        } else {
            let random_card;
            [random_card, remaining_deck] = GetAndRemoveRandomElementFromSet(remaining_deck);
            player_hand.push(random_card);
        }
    }

    const events = [...info.events];
    events.push({
        kind: 'DISCARD',
        player_id: player_id,
        discard: discard
    })
    const round_state: RoundState = {
        current_player: (player_id + 1) % info.player_count,
        deck: remaining_deck,
        events: events,
        kabayakawa: info.kabayakawa,
        phase: (player_id + 1) % info.player_count === info.starting_player ? 'STAKE' : 'DISCARD',
        player_count: info.player_count,
        player_hand: player_hand,
        player_wallets: info.player_wallets,
        pot: info.round_pot,
        starting_player: info.starting_player
    }

    const player_controllers = ArrayRange(info.player_count)
        .map(i => CreateRandomPlayer(i));
    const [winner, deltas] = SimRoundState(round_state, player_controllers)
    return winner;
}

export function CreateAlphaPlayer(player_id: number): PlayerController {
    const DiscardHandler: DiscardHandler = (hand, deal, info) => {
        let hand_wins = 0;
        for (let i = 0; i < 10; i++) {
            const winner = Sim(info, player_id, hand, deal);
            if (winner === player_id) {
                hand_wins += 1;
            }
        }

        let deal_wins = 0;
        for (let i = 0; i < 10; i++) {
            const winner = Sim(info, player_id, deal, hand);
            if (winner === player_id) {
                deal_wins += 1;
            }
        }

        return hand_wins >= deal_wins ? [hand, deal] : [deal, hand]
    }

    const StakeHandler: StakeHandler = (hand, info) => {
        const wallet = info.player_wallets[player_id];

        if (wallet > info.round_pot) {
            return true;
        } else {
            return false;
        }
    }

    return {
        DiscardHandler,
        StakeHandler
    }
}