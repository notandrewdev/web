import React, { memo } from 'react'

import featuresImage from '../../images/home/features.webp'

import '../../scss/components/Home/Features.scss'

const HomeFeatures = () => (
	<div className="features">
		<h2 className="title">
			<strong>Everything you need</strong><br />
			to start memorizing
		</h2>
		<img src={featuresImage} alt="Features" />
	</div>
)

export default memo(HomeFeatures)