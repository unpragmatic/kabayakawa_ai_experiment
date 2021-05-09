import { PlayerController, DiscardHandler, StakeHandler } from "./player_controller";


export function CreateRandomPlayer(player_id: number): PlayerController {
    const DiscardHandler: DiscardHandler = (hand, deal, info) => {
        if (Math.random() > 0.5) {
            return [hand, deal]
        } else {
            return [deal, hand]
        }
    }

    const StakeHandler: StakeHandler = (hand, info) => {
        if (info.player_wallets[player_id] > info.round_pot) {
            return Math.random() > 0.5 ? true : false;
        } else {
            return false;
        }
    }

    return {
        DiscardHandler,
        StakeHandler
    }
} 