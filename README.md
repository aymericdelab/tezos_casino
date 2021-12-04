# Tezos Casino

Tezos Casino is an implementation of a smart contract representing a betting game where you can participate, bet on black or red, and win 2x your money if you win. If not, the smart contract keeps the funds. 

The code contains both the smart contract written in Pascaligo and the front-end written in Typescript + React.

![alt text](https://raw.githubusercontent.com/aymericdelab/tezos_casino/main/images/app.png)

## Smart Contract

The smart contract has been written in Ligo, which is a high-level language that compiles into Michelson. Several syntaxes are supported for Ligo, here I am using the Pascal like syntax.

The smart contract has been deployed on the Granadanet Testnet and can be found and interacted with here: https://better-call.dev/granadanet/KT1HJm24U7n6S7Wh9vFEdB97MGyQ7DzoM9LY

The smart contract dictates the logic of the app. In order to interact with it, there are several entrypoints:

- fund: a function that allows anybody to add funds to the smart contract. This allows the smart contract to have enough liquidity to reimburse players.

- participate: a user can participate in the Casino by sending 1 tez (Tezos Token) to the smart contract and by also specifying a boolean as argument. The boolean represents a color: true for black and false for red. The smart contract then keeps a record of all the different participants and their predictions.

- draw: a function that will draw a random number in order to decide the winning color. Since smart contracts cannot create randomness, I need to simulate randomness by dividing finding a pseudo-random number already present in on the blockchain and using a modulo 2 to determine black or red. The pseudo-random number that we use here is the price of Bitcoin. The price is retrieved using an Oracle (anther smart contract: https://better-call.dev/granadanet/KT1AQuWowr3WKwF69oTGcKaJrMajic3CKwR2/operations)

- claim: once a winning color has been drawned, a user can claim back his funds (x2) if he has won.


## Front End

The front end is a react app written with typescript. 

The app uses the Temple Wallet library and Taquito to :

- connect to the user's wallet
- show some of the user's information (address and balance)
- interact with the smart contract


