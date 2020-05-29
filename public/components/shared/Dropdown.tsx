import React, { PropsWithChildren, useRef, useEffect } from 'react'
import cx from 'classnames'

import styles from 'styles/components/Dropdown.module.scss'

export enum DropdownShadow {
	None = 'none',
	Around = 'around',
	Screen = 'screen'
}

export default (
	{
		className,
		shadow,
		isRightAligned = true,
		topMargin = '8px',
		trigger,
		isShowing,
		setIsShowing,
		children
	}: PropsWithChildren<{
		className?: string
		shadow: DropdownShadow
		isRightAligned?: boolean
		topMargin?: string
		trigger: JSX.Element
		isShowing: boolean
		setIsShowing: (isShowing: boolean) => void
	}>
) => {
	const ref = useRef(null as HTMLDivElement | null)
	
	useEffect(() => {
		const onClick = ({ target }: Event) => {
			const { current } = ref
			
			if (!current || target === current || current.contains(target as Node | null) || !isShowing)
				return
			
			setIsShowing(false)
		}
		
		const { body } = document
		
		body.addEventListener('click', onClick)
		
		return () => body.removeEventListener('click', onClick)
	}, [isShowing]) // eslint-disable-line
	
	return (
		<div
			ref={newRef => ref.current = newRef}
			className={cx('dropdown', className, { showing: isShowing })}
			onClick={event => event.stopPropagation()}
		>
			<button
				className="trigger"
				onClick={() => setIsShowing(!isShowing)}
			>
				{trigger}
			</button>
			{isShowing && (
				<div
					className={cx('content', {
						[`shadow-${shadow}`]: shadow !== DropdownShadow.None,
						'right-aligned': isRightAligned
					})}
					style={{ top: `calc(100% + ${topMargin})` }}
				>
					{children}
				</div>
			)}
		</div>
	)
}
