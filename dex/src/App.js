import { Route, Routes } from 'react-router-dom'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

import "./App.css";
import Header from './components/Header'
import Swap from './components/Swap'
import Tokens from './components/Tokens'

function App() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new MetaMaskConnector()
  })

  const { disconnect } = useDisconnect()
  
  return(
    <div className="App">
      <Header connect={connect} isConnected={isConnected} address={address} disconnect={disconnect} />
      <div className='mainWindow'>
        <Routes>
          <Route path='/' element={<Swap />} />
          <Route path='/tokens' element={<Tokens />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;
