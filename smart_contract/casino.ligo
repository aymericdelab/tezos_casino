// in case of no operation
const noops: list(operation) = (nil: list(operation))

// input of the oracle entrypoint
type parameters is string * (timestamp * nat)

// I don't understand this part !!!
type oracle_entrypoint is contract(string * contract(parameters))

// list of people with tickets
type participants is map (address, bool)

type storage is record[
    price: nat;
    oracle: address;
    black_winning_color: bool;
    drawed: bool;
    participants: participants;
] 

type action is 
| Oracle_callback of parameters
| Draw
| Participate of bool
| Claim
| Fund

type return is list(operation) * storage

function participate(const prediction: bool; var s: storage): return is
    begin
    if Tezos.amount = 1tz then {
        // get participant address
        const participant_address: address = Tezos.sender;
        // if the participant is already in the map then fail
        case (s.participants[Tezos.sender]) of 
        Some(c) -> failwith("You are already participating ...")
        |None -> skip
        end;
        //update the map with the address prediction pair
        s.participants[participant_address] := prediction;
    } else {
        failwith("The price of a ticket is 1tz...")
    }
    end with (noops, s)

// put money in the contract wallet
function fund_contract(const _p: unit; var s: storage): return is (noops, s)

// a user can claim its funds back once the bet is settled
function get_funds_back(const _p: unit; var s: storage): return is 
    begin

    //check if the bet has been settled
    if s.drawed = False then failwith("Please wait for the bet to be settled ...") else skip;

    //const receiver_address: address = ("tz1fPRuwRUXFGffFJVFpDeDmT7uxVBm4WHpV": address);
    const participant_black_winning_color: bool = case (s.participants [Tezos.sender]: option(bool)) of
    Some(a) -> a
    | None -> (failwith("Only participants can get funds back..."): bool)
    end;

    //check if the participant won
    if participant_black_winning_color =/= s.black_winning_color then failwith("The participant lost, no funds to claim ...") else skip;

    //Define the receiver address
    const receiver_address: address = Tezos.sender;
    const receiver_contract : contract (unit) =
    case (Tezos.get_contract_opt (receiver_address) : option (contract (unit))) of
    Some (c) -> c
    | None -> (failwith ("winner contract not found.") : contract (unit))
    end;
    end with (list[(Tezos.transaction(unit, 1tz, receiver_contract))], s)

// it is my storage that gets updated because it's my entrypoint, it is his parameters though
function oracle_callback(const p: parameters; var s: storage): return is 
    //without begin or end i get an error on the record update line??
    begin
    //only oracle can call that function
    if Tezos.sender =/= s.oracle then failwith(403) else skip;
    s.price := p.1.1;

    // define the random number
    const price_mod: nat = p.1.1 mod 2;

    // set drawed as true
    s.drawed := True;

    // define the winning color from random number
    if price_mod = 0n then {
        s.black_winning_color := True;
    }
    else {
        s.black_winning_color := False;
    };
    end with (noops, s)


function draw(const _p: unit; var s: storage): return is 
    begin
    // get entrypoint of callback
    const oracle: oracle_entrypoint = case (Tezos.get_entrypoint_opt("%get", s.oracle): option(oracle_entrypoint)) of
    Some(c) -> c
    | None -> (failwith ("Contract not found.") : oracle_entrypoint)
    end;
    end with (list [Tezos.transaction(("BTC-USD",
    (Tezos.self("%oracle_callback"): contract(parameters))), 0tz, oracle) ], s)

function main(const action: action; var s: storage): return is
    case action of
    Oracle_callback(p) -> oracle_callback(p, s)
    | Draw(p) -> draw(p, s)
    | Participate(p) -> participate(p, s)
    | Claim(p) -> get_funds_back(p, s)
    | Fund(p) -> fund_contract(p, s)
    end;