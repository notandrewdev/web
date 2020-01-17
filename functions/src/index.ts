import { initializeApp } from 'firebase-admin'

initializeApp()

export {
	userCreated,
	userUpdated,
	userDeleted
} from './User/functions'

export {
	deckCreated,
	deckUpdated,
	deckDeleted,
	deckUserNodeCreated,
	deckUserNodeUpdated,
	deckUserNodeDeleted,
	deckDueCardCountPubSub
} from './Deck/functions'

export {
	sectionDeleted
} from './Section/functions'

export {
	cardCreated,
	cardUpdated,
	cardDeleted,
	reviewCard,
	getCardPrediction
} from './Card/functions'

export {
	topicDeleted
} from './Topic/functions'
