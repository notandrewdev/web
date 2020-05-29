import React, { useContext, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import cx from 'classnames'

import Dashboard, { DashboardNavbarSelection as Selection } from 'components/Dashboard'
import requiresAuth from 'hooks/requiresAuth'
import useCurrentUser from 'hooks/useCurrentUser'
import useCreatedDeck from 'hooks/useCreatedDeck'
import useImageUrl from 'hooks/useImageUrl'
import useTopics from 'hooks/useTopics'
import LoadingState from 'models/LoadingState'
import DeckImageUrlsContext from 'context/DeckImageUrls'
import { setDeckImageUrl, setDeckImageUrlLoadingState } from 'actions'
import Head, { APP_DESCRIPTION } from 'components/shared/Head'
import Button from 'components/shared/Button'
import PublishDeckContent from 'components/shared/PublishDeckContent'
import Loader from 'components/shared/Loader'
import { handleError } from 'lib/utils'

import styles from 'styles/components/Dashboard/EditDeck.module.scss'

export default () => {
	requiresAuth()
	
	const didUpdateFromDeck = useRef(false)
	
	const router = useRouter()
	const { slugId, slug } = router.query as {
		slugId: string
		slug: string
	}
	
	const [, dispatchDeckImageUrls] = useContext(DeckImageUrlsContext)
	
	const [currentUser] = useCurrentUser()
	const deck = useCreatedDeck(slugId, slug)
	const topics = useTopics()
	
	const [existingImageUrl, existingImageUrlLoadingState] = useImageUrl(deck)
	const [imageUrl, setImageUrl] = useState(null as string | null)
	
	const [image, setImage] = useState(undefined as File | null | undefined)
	const [name, setName] = useState(deck?.name ?? '')
	const [subtitle, setSubtitle] = useState(deck?.subtitle ?? '')
	const [description, setDescription] = useState(deck?.description ?? '')
	const [selectedTopics, setSelectedTopics] = useState(deck?.topics ?? [])
	
	const [loadingState, setLoadingState] = useState(LoadingState.None)
	
	const isLoading = loadingState === LoadingState.Loading
	const isDisabled = !name
	
	const closeUrl = `/decks/${slugId ?? ''}/${slug ?? ''}`
	const headDescription = `Edit ${deck?.name ?? 'your deck'} on memorize.ai. ${APP_DESCRIPTION}`
	
	useEffect(() => {
		if (!deck || didUpdateFromDeck.current)
			return
		
		didUpdateFromDeck.current = true
		
		setName(deck.name)
		setSubtitle(deck.subtitle)
		setDescription(deck.description)
		setSelectedTopics(deck.topics)
	}, [deck])
	
	useEffect(() => {
		if (existingImageUrlLoadingState !== LoadingState.Success)
			return
		
		setImageUrl(existingImageUrl)
		setImage(undefined)
	}, [existingImageUrl, existingImageUrlLoadingState])
	
	const edit = async () => {
		if (!(deck && currentUser))
			return
		
		try {
			setLoadingState(LoadingState.Loading)
			
			const deckId = deck.id
			
			const imageUrl = await deck.edit(currentUser.id, {
				image,
				name,
				subtitle,
				description,
				topics: selectedTopics
			})
			
			if (imageUrl !== undefined)
				dispatchDeckImageUrls(setDeckImageUrl(
					deckId,
					imageUrl
				))
			
			dispatchDeckImageUrls(setDeckImageUrlLoadingState(
				deckId,
				LoadingState.Success
			))
			
			setLoadingState(LoadingState.Success)
			router.push('/decks/[slugId]/[slug]', closeUrl)
		} catch (error) {
			setLoadingState(LoadingState.Fail)
			handleError(error)
		}
	}
	
	return (
		<Dashboard selection={Selection.Decks} className="edit-deck publish-deck">
			<Head
				title={`Edit ${deck?.name ?? 'deck'} | memorize.ai`}
				description={headDescription}
				breadcrumbs={[
					[
						{
							name: 'Decks',
							url: 'https://memorize.ai/decks'
						},
						{
							name: deck?.name ?? 'Deck',
							url: `https://memorize.ai/decks/${deck?.slugId ?? '...'}/${deck?.slug ?? '...'}`
						},
						{
							name: 'Edit',
							url: `https://memorize.ai${router.asPath}`
						}
					]
				]}
			/>
			<div className="header">
				<Link href="/decks/[slugId]/[slug]" as={closeUrl}>
					<a className="close">
						<FontAwesomeIcon icon={faTimes} />
					</a>
				</Link>
				<h1>Edit <span>{deck?.name ?? 'deck'}</span></h1>
				<Button
					loaderSize="16px"
					loaderThickness="3px"
					loaderColor="#582efe"
					loading={isLoading}
					disabled={isDisabled}
					onClick={edit}
				>
					Save
				</Button>
			</div>
			<div className="content">
				<div className={cx('box', { loading: !deck })}>
					{deck
						? (
							<PublishDeckContent
								isImageLoading={existingImageUrlLoadingState === LoadingState.Loading}
								imageUrl={imageUrl}
								name={name}
								subtitle={subtitle}
								description={description}
								topics={topics}
								selectedTopics={selectedTopics}
								
								setImage={image => {
									setImageUrl(image && URL.createObjectURL(image))
									setImage(image)
								}}
								setName={setName}
								setSubtitle={setSubtitle}
								setDescription={setDescription}
								setSelectedTopics={setSelectedTopics}
							/>
						)
						: <Loader size="24px" thickness="4px" color="#582efe" />
					}
				</div>
			</div>
		</Dashboard>
	)
}
