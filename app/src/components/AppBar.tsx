import { FC } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const AppBar: FC = () => {
    return (
        <div>
            <WalletMultiButton/>
        </div>
    )
}