import React, { useState, useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons'
import cx from 'classnames'

import Dashboard, { DashboardNavbarSelection as Selection } from 'components/Dashboard'
import Deck from 'models/Deck'
import { DEFAULT_DECK_SORT_ALGORITHM } from 'models/Deck/Search'
import Counters, { Counter } from 'models/Counters'
import LoadingState from 'models/LoadingState'
import DeckImageUrlsContext from 'context/DeckImageUrls'
import useSearchState from 'hooks/useSearchState'
import useDeck from 'hooks/useDeck'
import useSections from 'hooks/useSections'
import useAllCards from 'hooks/useAllCards'
import useTopics from 'hooks/useTopics'
import useCreator from 'hooks/useCreator'
import useSimilarDecks from 'hooks/useSimilarDecks'
import Head from 'components/shared/Head'
import Input from 'components/shared/Input'
import SortDropdown from 'components/shared/SortDropdown'
import { DropdownShadow } from 'components/shared/Dropdown'
import Header from 'components/Dashboard/DeckPage/Header'
import Preview from 'components/Dashboard/DeckPage/Preview'
import Footer from 'components/Dashboard/DeckPage/Footer'
import Controls from 'components/Dashboard/DeckPage/Controls'
import SimilarDecks, { SIMILAR_DECKS_CHUNK_SIZE } from 'components/Dashboard/DeckPage/SimilarDecks'
import Cards from 'components/Dashboard/DeckPage/Cards'
import Comments from 'components/Dashboard/DeckPage/Comments'
import Loader from 'components/shared/Loader'
import { formatNumber } from 'lib/utils'

import styles from 'styles/components/Dashboard/DeckPage.module.scss'

export default () => {
	const [imageUrls] = useContext(DeckImageUrlsContext)
	
	const router = useRouter()
	const { slugId } = router.query as { slugId: string }
	
	const [{ query, sortAlgorithm }] = useSearchState()
	
	const { deck, hasDeck } = useDeck(slugId)
	
	const imageUrlObject = (deck && imageUrls[deck.id]) ?? null
	
	const hasImageUrlLoaded = imageUrlObject?.loadingState === LoadingState.Success
	const imageUrl = imageUrlObject?.url ?? Deck.DEFAULT_IMAGE_URL
	
	const creator = useCreator(deck?.creatorId)
	const sections = useSections(deck?.id)
	const cards = useAllCards(deck?.id)
	const topics = useTopics()
	const similarDecks = useSimilarDecks(deck, SIMILAR_DECKS_CHUNK_SIZE)
	
	const [isSortDropdownShowing, setIsSortDropdownShowing] = useState(false)
	
	const numberOfDecks = Counters.get(Counter.Decks)
	
	const description = useMemo(() => (
		deck?.description || `${
			deck?.averageRating
				? `${
					deck.averageRating.toFixed(1)
				} star${
					deck.averageRating === 1 ? '' : 's'
				} - `
				: ''
		}${
			formatNumber(deck?.numberOfCards ?? 0)
		} card${
			deck?.numberOfCards === 1 ? '' : 's'
		} - ${
			formatNumber(deck?.numberOfDownloads ?? 0)
		} download${
			deck?.numberOfDownloads === 1 ? '' : 's'
		}. Get ${
			deck?.name ?? 'this deck'
		} on memorize.ai${
			creator ? ` by ${creator.name}` : ''
		}.`
	), [deck, creator])
	
	return (
		<Dashboard selection={Selection.Market} className="deck-page">
			<Head
				isPrerenderReady={Boolean(
					deck && hasImageUrlLoaded && creator && sections && cards && topics && similarDecks
				)}
				title={`${deck ? `${deck.name} | ` : ''}memorize.ai`}
				description={description}
				ogImage={imageUrl}
				labels={[
					{
						name: 'Rating',
						value: deck?.numberOfRatings
							? deck.averageRating.toFixed(1)
							: 'No ratings'
					},
					{
						name: 'Downloads',
						value: formatNumber(deck?.numberOfDownloads ?? 0)
					},
					{
						name: 'Cards',
						value: formatNumber(deck?.numberOfCards ?? 0)
					}
				]}
				breadcrumbs={[
					[
						{
							name: 'Market',
							url: 'https://memorize.ai/market'
						},
						{
							name: deck?.name ?? 'Deck',
							url: `https://memorize.ai${router.asPath}`
						}
					]
				]}
				schemaItems={[
					{
						'@type': 'IndividualProduct',
						productID: deck?.slugId ?? '...',
						image: imageUrl,
						name: deck?.name ?? 'Deck',
						description: deck?.description ?? '',
						url: `https://memorize.ai${router.asPath}`,
						aggregateRating: {
							'@type': 'AggregateRating',
							ratingValue: deck?.averageRating ?? 0,
							reviewCount: deck?.numberOfRatings || 1,
							worstRating: deck?.worstRating ?? 0,
							bestRating: deck?.bestRating ?? 0
						}
					}
				]}
			/>
			<div className="header">
				<Link
					href="/new"
					aria-label="Create your own deck!"
					data-balloon-pos="right"
				>
					<a className="create">
						<FontAwesomeIcon icon={faPlus} />
					</a>
				</Link>
				<Input
					className="search"
					icon={faSearch}
					type="name"
					placeholder={
						`Explore ${numberOfDecks === null ? '...' : formatNumber(numberOfDecks)} decks`
					}
					value={query}
					setValue={newQuery =>
						router.push({
							pathname: '/market',
							query: {
								q: newQuery,
								s: sortAlgorithm === DEFAULT_DECK_SORT_ALGORITHM
									? null
									: sortAlgorithm
							}
						})
					}
				/>
				<SortDropdown
					shadow={DropdownShadow.Around}
					isShowing={isSortDropdownShowing}
					setIsShowing={setIsSortDropdownShowing}
					algorithm={sortAlgorithm}
					setAlgorithm={newSortAlgorithm =>
						router.push({
							pathname: '/market',
							query: {
								q: query,
								s: newSortAlgorithm === DEFAULT_DECK_SORT_ALGORITHM
									? null
									: newSortAlgorithm
							}
						})
					}
				/>
			</div>
			<div className={cx('box', { loading: !deck })}>
				{deck
					? (
						<>
							<Header deck={deck} hasDeck={hasDeck} />
							{deck.numberOfCards > 0 && <Preview deck={deck} />}
							<Footer deck={deck} />
							<Controls deck={deck} hasDeck={hasDeck} />
							<SimilarDecks deck={deck} />
							<Cards deck={deck} />
							<Comments deck={deck} />
						</>
					)
					: <Loader size="24px" thickness="4px" color="#582efe" />
				}
			</div>
		</Dashboard>
	)
}
