import { Card } from "../state";
import { PlayerController, DiscardHandler, StakeHandler } from "./player_controller";

function MinCard(left: Card, right: Card): Card {
    return left < right ? left : right;
}

function OtherCard(left: Card, right: Card, card: Card): Card {
    return (left * right) / card as Card;
}

function SortCard(left: Card, right: Card): [lower: Card, higher: Card] {
    return left < right ? [left, right] : [right, left];
}

export function CreateSimpleAIPlayer(player_id: number): PlayerController {
    const DiscardHandler: DiscardHandler = (hand, deal, info) => {
        const { kabayakawa } = info;
        const [lower, higher ] = SortCard(hand, deal); 
        if (lower + kabayakawa > higher) {
            return [lower, higher]
        } else {
            return [higher, lower]
        }
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