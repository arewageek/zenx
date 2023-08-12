import React, { useState, useEffect } from 'react'
import { Input, Modal, Popover, Radio } from 'antd'
import { ArrowDownOutlined, DownOutlined, SettingOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useSendTransaction, useWaitForTransaction } from 'wagmi'

import tokenList from '../tokenList.json'

function Swap(props) {
  const { address, isConnected } = props

  const [slippage, setSlippage] = useState(2.5)
  const [tokenOneAmount, setTokenOneAmount] = useState(null)
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null)
  const [tokenOne, setTokenOne] = useState(tokenList[0])
  const [tokenTwo, setTokenTwo] = useState(tokenList[7])
  const [isOpen, setIsOpen] = useState(false)
  const [changeToken, setChangeToken] = useState(1)
  const [prices, setPrices] = useState(null)
  const [tx, setTx] = useState({
    to: null,
    data: null,
    value: null
  })

  const { data, sendTransaction} = useSendTransaction({
    request: {
      from: address,
      to: String(tx.to),
      data: String(tx.data),
      value: String(tx.value)
    }
  })
  

  const handleSlippageChange = (e) => {
    setSlippage(e.target.value)
  }

  const changeAmount = e => {
    setTokenOneAmount(e.target.value)
    if(e.target.value && prices){
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
    }
    else{
      setTokenTwoAmount(null)
    }
  }

  const switchTokens = () => {
    setTokenOne(tokenTwo)
    setTokenTwo(tokenOne)
    setTokenOneAmount(null)
    setTokenTwoAmount(null)

    fetchPrices(tokenTwo.address, tokenOne.address)
  }

  const openModal = (asset) => {
    setChangeToken(asset)
    setIsOpen(true)
  }

  const modifyToken = index => {
    setPrices(null)
    setIsOpen(false)
    if(changeToken === 1){
      setTokenOne(tokenList[index])
    }
    else{
      setTokenTwo(tokenList[index])
    }
  }

  const fetchPrices = async () => {
    const response = await axios.get('http://localhost:3001/tokenPrice',{
        params: {
          addressOne: tokenOne.address,
          addressTwo: tokenTwo.address,
        }
      }
    )
    
    console.log(response.data)
    setPrices(response.data)
  }

  const fetchDexSwap = async () => {
    const allowance = await axios.get(`https://api.1inch.io/v5.2/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress={address}`)
    if(allowance.data.allowance === "0"){
      const approve = await axios.get(`https://api.1inch.io/v5.2/1/approve/transaction?tokenAdress=${tokenOne.address}`)

      setTx(approve.data);
      console.log("Not allowed")
      return false;
    }

    console.lof('woerked')
  }



  useEffect(() => {
    fetchPrices(tokenOne.address, tokenTwo.address)
  }, [tokenOne, tokenTwo])

  useEffect(() => {
    if(tx.to && isConnected){
      sendTransaction();
    }
  }, [tx])
  
  const settings = (
    <>
      <div>Slippage Tollerane</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  )
  
  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a Token"
      >
        <div className='modalContent'>
          { tokenList?.map((e, index) => {
            return (
              <div className='tokenChoice' key={index} onClick={() => modifyToken(index)}>
                <img src={e.img} alt={e.ticker} className='tokenLogo' />
                <div className='tokenChoiceNames'>
                  <div className='tokenName'>
                    {e.name}
                  </div>
                  <div className='tokenTicker'>
                    {e.ticker}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>

      <div className='tradeBox' style={{margin: 'auto'}}>
        <div className='tradeBoxHeader'>
          <h4>Swap</h4>
          <Popover
            title="Settings"
            placement='bottomRight'
            trigger="click"
            content={settings}
          >
            <SettingOutlined className='cog' />
          </Popover>
        </div>

        <div className='inputs'>
          <Input placeholder='0' value={tokenOneAmount} onChange={changeAmount} />
          <Input placeholder='0' value={tokenTwoAmount} disabled />

          <div className='switchButton' onClick={switchTokens}>
            <ArrowDownOutlined className='switchArrow' />
          </div>

          <div className='assetOne' onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="Token Logo" className='assetLogo' />
            { tokenOne.ticker }
            <DownOutlined />
          </div>

          <div className='assetTwo' onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="Token Logo" className='assetLogo' />
            { tokenTwo.ticker }
            <DownOutlined />
          </div>
        </div>

        <div className='swapButton' onClick={fetchDexSwap} disabled={!tokenOneAmount || (isConnected)}>Swap</div>
      </div>
    </>
  )
}

export default Swap