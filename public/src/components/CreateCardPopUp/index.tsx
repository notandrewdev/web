import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'

import {
	setIsObservingDecks,
	updateDeck,
	removeDeck,
	setIsObservingSections,
	addSection,
	updateSection,
	removeSection
} from '../../actions'
import { State } from '../../reducers'
import Deck from '../../models/Deck'
import Section from '../../models/Section'
import useQuery from '../../hooks/useQuery'
import useCurrentUser from '../../hooks/useCurrentUser'
import firebase from '../../firebase'
import TopGradient from '../shared/TopGradient'
import Decks from './Decks'
import Sections from './Sections'

import 'firebase/analytics'

export interface CreateCardPopUpOwnProps {
	match: {
		params: {
			deckId?: string
			sectionId?: string
		}
	}
}

export interface CreateCardPopUpProps {
	decks: Deck[]
	
	deck?: Deck
	section?: Section
	
	isObservingDecks: boolean
	setIsObservingDecks: (value: boolean) => void
	updateDeck: (snapshot: firebase.firestore.DocumentSnapshot) => void
	removeDeck: (id: string) => void
	
	setIsObservingSections: (deckId: string, value: boolean) => void
	addSection: (deckId: string, snapshot: firebase.firestore.DocumentSnapshot) => void
	updateSection: (deckId: string, snapshot: firebase.firestore.DocumentSnapshot) => void
	removeSection: (deckId: string, sectionId: string) => void
}

const analytics = firebase.analytics()

const CreateCardPopUp = ({
	decks: unfilteredDecks,
	
	deck: currentDeck,
	section: currentSection,
	
	isObservingDecks,
	setIsObservingDecks,
	updateDeck,
	removeDeck,
	
	setIsObservingSections,
	addSection,
	updateSection,
	removeSection
}: CreateCardPopUpProps) => {
	const { deckId, sectionId } = useParams()
	const history = useHistory()
	
	const query = useQuery()
	const text = query.get('text') ?? ''
	const from = query.get('from') ?? ''
	
	const [currentUser] = useCurrentUser()
	
	const decks = unfilteredDecks.filter(deck =>
		deck.creatorId === currentUser?.uid
	)
	
	useEffect(() => {
		analytics.logEvent('show_create_card_pop_up', { from })
	}, [from])
	
	useEffect(() => {
		if (isObservingDecks || !currentUser)
			return
		
		setIsObservingDecks(true)
		Deck.observeForUserWithId(
			currentUser.uid, 
			{ updateDeck
			, removeDeck
			}
		)
	}, [isObservingDecks, currentUser]) // eslint-disable-line
	
	useEffect(() => {
		if (!decks.length || currentDeck || deckId)
			return
		
		history.push(
			`/create-card-pop-up/d/${
				decks[0].id
			}?text=${
				encodeURIComponent(text)
			}&from=${
				encodeURIComponent(from)
			}`
		)
	}, [decks, currentDeck, text, from]) // eslint-disable-line
	
	useEffect(() => {
		if (!currentDeck || currentDeck.isObservingSections)
			return
		
		setIsObservingSections(currentDeck.id, true)
		Section.observeForDeckWithId(currentDeck.id, {
			addSection,
			updateSection,
			removeSection
		})
	}, [currentDeck]) // eslint-disable-line
	
	useEffect(() => {
		if (!currentDeck || !currentDeck.sections.length || currentSection || sectionId)
			return
		
		history.push(
			`/create-card-pop-up/d/${
				currentDeck.id
			}/s/${
				currentDeck.sections[0].id
			}?text=${
				encodeURIComponent(text)
			}&from=${
				encodeURIComponent(from)
			}`
		)
	}, [currentDeck, currentSection, text, from]) // eslint-disable-line
	
	return (
		<div className="bg-light-gray">
			<TopGradient>
				<div className="p-4">
					<Decks
						decks={decks}
						currentDeck={currentDeck}
						text={text}
						from={from}
					/>
					<Sections
						currentDeck={currentDeck}
						currentSection={currentSection}
						text={text}
						from={from}
					/>
					{currentDeck && currentSection && (
						<div>
							EDITOR
						</div>
					)}
				</div>
			</TopGradient>
		</div>
	)
}

const mapStateToProps = (
	{ isObservingDecks, decks }: State,
	{ match: { params: { deckId, sectionId } } }: CreateCardPopUpOwnProps
) => {
	const deck = decks.find(deck => deck.id === deckId)
	
	return {
		decks,
		deck,
		section: deck?.sections.find(section => section.id === sectionId),
		isObservingDecks
	}
}

export default connect(mapStateToProps, {
	setIsObservingDecks,
	updateDeck,
	removeDeck,
	setIsObservingSections,
	addSection,
	updateSection,
	removeSection
})(CreateCardPopUp)
