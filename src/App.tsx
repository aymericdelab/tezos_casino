import React from 'react';
import { DAppProvider, useConnect, useWallet, useAccountPkh, useTezos } from './dapp/dapp'
import './App.css';
import { APP_NAME, NETWORK, CONTRACT_ADDRESS, WINNING_COLOR } from './dapp/defaults';
import { BigMapAbstraction } from "@taquito/taquito"

const Page = (props: { children: string | number | boolean | {} | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactNodeArray | React.ReactPortal | null | undefined; }) => {
  return <div className="App"> {props.children} </div>
}

function ConnexionButton() {
  const [balance, setBalance] = React.useState(null) 
  const wallet = useWallet()
  const accountPkh = useAccountPkh()
  const tezos = useTezos()
  const connect = useConnect()
  const handleConnect = React.useCallback(async () => {
    try {
      await connect(NETWORK, { forcePermission: true })
    } catch (err: any) {
      console.error(err.message);
    }
  }, [connect])

  //const Acc
  const loadBalance = React.useCallback( async () => {
    if (tezos) {
      const tezos0k = tezos as any
      const bal = await tezos0k.tz.getBalance(accountPkh)
      setBalance(tezos0k.format('mutez', 'tez', Math.round(bal/1000000)).toString())
    }
    }, [tezos, accountPkh, setBalance]
  )

  React.useEffect( () => {
    loadBalance()
  },
    [loadBalance]
  )

  return <div className="temple_wallet">
          <h2> Wallet Info </h2>
          <div>
          <div > User Address: {accountPkh} </div>
          <div > Tezos Balance: {balance} </div>
          </div>
          <div>
          <button onClick={handleConnect}>Connect account</button>
          </div>
        </div>
}


type contractStorage = {
  black_winning_color: boolean;
  drawed: boolean;
  oracle: string;
  participants: BigMapAbstraction;
  price: number
}


function CallContract() {
  // set contract
  const tezos = useTezos()
  const [contract, setContract] = React.useState(undefined)

  // async
  React.useEffect(() => {
      (async () => {
        if (tezos) {
          const ctr = await (tezos as any).wallet.at(CONTRACT_ADDRESS);
          setContract(ctr);
        }
        // need to add 2 parenthesis because it's a function
      })();
    }, [tezos]);

  type sendFundsParams = {fundAmount: number}
  const sendFunds = React.useCallback(
    ({fundAmount}: sendFundsParams) => {
      return (contract as any).methods.fund().send({amount: fundAmount})
  }, [contract])

  type participateParams = {black_color: boolean}
  const participate = React.useCallback(
     ({black_color}: participateParams) => {
       return (contract as any).methods.participate({color: black_color}).send({amount: 1})
     }, [contract])

  const claimFunds = React.useCallback(
    () => {
      return (contract as any).methods.claim().send({amount: 0})
    }, [contract]
  )

  const drawWinningColor = React.useCallback(
    () => {
      return (contract as any).methods.draw().send({amount: 0})
    }, [contract]
  )

  return (
  <div className="instructions">
    <h1> Contract Instructions </h1>
    <div className="instruction_button">
      <button onClick={() => sendFunds({fundAmount: 0.5})}> Fund 0.5 tez </button>
    </div>
    <div className="instruction_button">
      <button onClick={() => participate({black_color: true})}> Bet on the Black Color !</button>
      <button onClick={() => participate({black_color: false})}> Bet on the Red Color !</button>
    </div>
  <div className="instruction_button">
  </div>
  <div className="instruction_button">
      <button onClick={() => drawWinningColor()}> Draw Winner </button>
      <button onClick={() => claimFunds()}> Claim Your Prize </button>
  </div>
  <div className="instruction_button">
  </div>
  </div>
  )
}

function AppHeader() {
  return (<h1 className="App-header"> TEZOS CASINO </h1>)
} 


function ContractInfo() {
  // set state
  const [contract, setContract] = React.useState(undefined)
  const tezos = useTezos()
  const [storage, setStorage] = React.useState<contractStorage>()
  const temp_string = useAccountPkh()
  const accountPkh: string = !! temp_string ? temp_string : ""

  // async
  React.useEffect(() => {
      (async () => {
        if (tezos) {
          const ctr = await (tezos as any).wallet.at(CONTRACT_ADDRESS);
          setContract(ctr);
        }
        // need to add 2 parenthesis because it's a function
      })();
    }, [tezos]);

  const loadStorage = 
    React.useCallback( async () => {
      if (contract) {
        const str = await (contract as any).storage()
        setStorage(str)
      }
    }, [contract])

  React.useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  return (
  <div className="storage_info">
    <h2> Casino Info </h2>
    <div>
    <div style={{float: "left"}}>
      Winning Color: {!!storage ? WINNING_COLOR.get(storage.black_winning_color) : ""}
    </div>
    </div>
    <div>
    <div style={{float: "left"}}>
      Participant Color: {!!storage ? WINNING_COLOR.get(storage.participants.get(accountPkh).toString() === 'true'): ""}
    </div>
    </div>
  </div>
  )

}

function App() {
  return (
          <DAppProvider appName={APP_NAME}>
            <React.Suspense fallback={null}>
              <AppHeader></AppHeader>
              <ConnexionButton></ConnexionButton>
              <Page>
                <ContractInfo></ContractInfo>
                <CallContract></CallContract>
              </Page>
            </React.Suspense>
          </DAppProvider>
  );
}



export default App;