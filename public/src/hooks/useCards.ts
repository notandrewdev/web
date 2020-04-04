import { useContext, useEffect } from 'react'

import CardsContext from '../contexts/Cards'
import {
	initializeCards,
	addCard,
	updateCard,
	updateCardUserData,
	removeCard
} from '../actions'
import Deck from '../models/Deck'
import Section from '../models/Section'
import Card from '../models/Card'
import useCurrentUser from './useCurrentUser'
import { compose } from '../utils'

export default (deck: Deck, section: Section, shouldLoadCards: boolean): Card[] | null => {
	const [{ [section.id]: cards }, dispatch] = useContext(CardsContext)
	
	const [currentUser] = useCurrentUser()
	
	useEffect(() => {
		if (!shouldLoadCards || cards || !currentUser)
			return
		
		Card.observe({
			deckId: deck.id,
			sectionId: section.id,
			uid: currentUser.id,
			initializeCards: compose(dispatch, initializeCards),
			addCard: compose(dispatch, addCard),
			updateCard: compose(dispatch, updateCard),
			updateCardUserData: compose(dispatch, updateCardUserData),
			removeCard: compose(dispatch, removeCard)
		})
	}, [shouldLoadCards, cards, currentUser])
	
	return cards ?? null
}
