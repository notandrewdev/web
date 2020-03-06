import React, { HTMLAttributes } from 'react'

import { APP_STORE_URL } from '../../constants'
import { ReactComponent as AppStoreDownloadImage } from '../../images/app-store-download.svg'

export default (props: HTMLAttributes<HTMLAnchorElement>) => (
	<a {...props} href={APP_STORE_URL}>
		<AppStoreDownloadImage />
	</a>
)
