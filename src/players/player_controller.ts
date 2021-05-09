import { Card, GameInformation } from "../state"

export type DiscardHandler = (hand: Card, deal: Card, info: GameInformation) => [hand: Card, discard: Card]
export type StakeHandler = (hand: Card, info: GameInformation) => boolean

export interface PlayerController {
    DiscardHandler: DiscardHandler
    StakeHandler: StakeHandler
}
