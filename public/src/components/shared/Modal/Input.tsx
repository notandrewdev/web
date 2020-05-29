import React, { useCallback } from 'react'

import Modal from '../../shared/Modal'

import { ReactComponent as TimesIcon } from '../../../images/icons/times.svg'

import '../../../styles/components/Modal/Input.scss'

export interface InputModalProps {
	title: string
	placeholder: string
	buttonText: string
	buttonBackground?: string
	value: string
	setValue: (value: string) => void
	onClick: () => void
	isDisabled: boolean
	isShowing: boolean
	setIsShowing: (isShowing: boolean) => void
}

export default ({
	title,
	placeholder,
	buttonText,
	buttonBackground = '',
	value,
	setValue,
	onClick,
	isDisabled,
	isShowing,
	setIsShowing
}: InputModalProps) => {
	const onInputRef = useCallback((input: HTMLInputElement | null) => {
		if (input)
			input[isShowing ? 'focus' : 'blur']()
	}, [isShowing])
	
	return (
		<Modal
			className="input-modal"
			isLazy={true}
			isShowing={isShowing}
			setIsShowing={setIsShowing}
		>
			<div className="header">
				<h2 className="title">
					{title}
				</h2>
				<button
					className="hide"
					onClick={() => setIsShowing(false)}
				>
					<TimesIcon />
				</button>
			</div>
			<div className="content">
				<input
					ref={onInputRef}
					placeholder={placeholder}
					value={value}
					onChange={({ target }) => setValue(target.value)}
				/>
				<button
					disabled={isDisabled}
					onClick={onClick}
					style={{ background: buttonBackground }}
				>
					{buttonText}
				</button>
			</div>
		</Modal>
	)
}
