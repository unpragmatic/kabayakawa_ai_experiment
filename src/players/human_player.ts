import { Card, GameInformation } from "../state";
import { PlayerController, DiscardHandler, StakeHandler } from "./player_controller";
import readline from "readline-sync";


function DisplayGameInfo(player_id: number, info: GameInformation) {
    console.log(`The kabayakawa is ${info.kabayakawa}`);
    console.log(`You have ${info.player_wallets[player_id]} coins`);
    console.log(`This round's pot is ${info.round_pot}`);
}

export function CreateHumanPlayer(player_id: number): PlayerController {
    const DiscardHandler: DiscardHandler = (hand, deal, info) => {
        DisplayGameInfo(player_id, info);
       
        const chosen_card_string = readline.question(`Which card do you want to keep, either ${hand} or ${deal}? `);
        const chosen_card = parseInt(chosen_card_string) as Card;

        const discard: Card = (hand * deal) / chosen_card as Card;
        return [chosen_card, discard]
    }

    const StakeHandler: StakeHandler = (hand, info) => {
        DisplayGameInfo(player_id, info);

        const stake_string = readline.question(`Do you want to stake (y/n)? `);
        if (stake_string === 'y') {
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