interface arrayData {
    name: string
    code: string
    title: string
    description: string
    longDescription: string
    icon: string
    input?: any[]
}

interface Contract {
    [key: string]: arrayData[]
}


export const contractsCode: Contract = {
    nftminter: [
        {
            input: [],
            title: "NFT Minter",
            description: "Create collection of unique NFTs.",
            longDescription: "The NFT-minter SC is meant to act as a template for NFT projects. This contract allows one to create his own collection of NFTs. The way it works is pretty straigh forward: The person creates a collection in which he will be able to mint individual NFTs.",
            icon: "bi bi-file-earmark-arrow-up",
            name: 'nftminter.rs',
            code: `#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

const NFT_AMOUNT: u32 = 1;
const ROYALTIES: u32 = 10_000;

#[derive(TypeAbi, TopEncode, TopDecode)]
pub struct PriceTag<M: ManagedTypeApi> {
    pub token: EgldOrEsdtTokenIdentifier<M>,
    pub nonce: u64,
    pub amount: BigUint<M>,
}

#[derive(TypeAbi, TopEncode, TopDecode)]
pub struct ExampleAttributes {
    pub creation_timestamp: u64,
}

#[multiversx_sc::contract]
pub trait NftMinter {

    #[init]
    fn init(&self) {}

    #[allow(clippy::too_many_arguments)]
    #[allow(clippy::redundant_closure)]
    #[endpoint]
    fn create_nft(
        &self,
        name: ManagedBuffer,
        uri: ManagedBuffer,
    ) {
        
        let attributes = ExampleAttributes {
            creation_timestamp: self.blockchain().get_block_timestamp(),
        };

        let caller = self.blockchain().get_caller();
        self.create_nft_with_attributes(
            name,
            attributes,
            uri,
            caller
        );
    }


    #[payable("EGLD")]
    #[endpoint(issueToken)]
    fn issue_token(&self, token_name: ManagedBuffer, token_ticker: ManagedBuffer) {

        let caller = self.blockchain().get_caller();
        require!(self.nft_token_id(&caller).is_empty(), "Token already issued for this address");
        let payment_amount = self.call_value().egld_value();
        self.send()
            .esdt_system_sc_proxy()
            .issue_non_fungible(
                payment_amount,
                &token_name,
                &token_ticker,
                NonFungibleTokenProperties {
                    can_freeze: true,
                    can_wipe: true,
                    can_pause: true,
                    can_transfer_create_role: true,
                    can_change_owner: false,
                    can_upgrade: false,
                    can_add_special_roles: true,
                },
            )
            .async_call()
            .with_callback(self.callbacks().issue_callback(&caller))
            .call_and_exit()
    }

    #[callback]
    fn issue_callback(
        &self,
        #[call_result] result: ManagedAsyncCallResult<EgldOrEsdtTokenIdentifier>,
        caller: &ManagedAddress,
    ) {
        match result {
            ManagedAsyncCallResult::Ok(token_id) => {
                self.nft_token_id(&caller).set(&token_id.unwrap_esdt());
                self.set_local_roles(&caller);
            },
            ManagedAsyncCallResult::Err(_) => {
                let returned = self.call_value().egld_or_single_esdt();
                if returned.token_identifier.is_egld() && returned.amount > 0 {
                    self.send()
                        .direct(&caller, &returned.token_identifier, 0, &returned.amount);
                }
            },
        }
    }

    fn set_local_roles(&self, caller: &ManagedAddress) {
        self.require_token_issued(&caller);

        self.send()
            .esdt_system_sc_proxy()
            .set_special_roles(
                &self.blockchain().get_sc_address(),
                &self.nft_token_id(&caller).get(),
                [EsdtLocalRole::NftCreate][..].iter().cloned(),
            )
            .async_call()
            .call_and_exit()
    }

    #[allow(clippy::too_many_arguments)]
    fn create_nft_with_attributes<T: TopEncode>(
        &self,
        name: ManagedBuffer,
        attributes: T,
        uri: ManagedBuffer,
        caller: ManagedAddress
    ) -> u64 {
        self.require_token_issued(&caller);

        let nft_token_id = self.nft_token_id(&caller).get();

        let mut serialized_attributes = ManagedBuffer::new();
        if let core::result::Result::Err(err) = attributes.top_encode(&mut serialized_attributes) {
            sc_panic!("Attributes encode error: {}", err.message_bytes());
        }

        let attributes_sha256 = self.crypto().sha256(&serialized_attributes);
        let attributes_hash = attributes_sha256.as_managed_buffer();
        let uris = ManagedVec::from_single_item(uri);
        let nft_nonce = self.send().esdt_nft_create(
            &nft_token_id,
            &BigUint::from(NFT_AMOUNT),
            &name,
            &BigUint::from(ROYALTIES),
            attributes_hash,
            &attributes,
            &uris,
        );

        self.send().direct_esdt(
            &caller,
            &nft_token_id,
            nft_nonce,
            &BigUint::from(NFT_AMOUNT),
        );

        nft_nonce
    }

    fn require_token_issued(&self, owner: &ManagedAddress) {
        require!(!self.nft_token_id(&owner).is_empty(), "token not issued");
    }

    #[storage_mapper("nftTokenId")]
    fn nft_token_id(&self, owner: &ManagedAddress) -> SingleValueMapper<TokenIdentifier>;
}`
        },
    ],
    tokenswap: [
        {
            input: [{
                label: "Token identifier",
                datatype: "string"
            }, {
                label: "Swap rate",
                datatype: "number"
            }],
            title: "Token Swap",
            description: "Swap EGLD with another token, with a fixed rate",
            longDescription: "The EGLD-ESDT swap is a simple SC that allows the exchange between EGLD and another token on MetaversX blockchain. This contract allows one to create an exchange pool that others can use. He can chose the token to pair with EGLD and the exchange rate (this can be changed even after contract deployment).",
            icon: "bi bi-arrow-left-right",
            name: 'tokenswap.rs',
            code: `#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub trait EgldEsdtSwap {

    #[init]
    fn init(&self, esdt: EgldOrEsdtTokenIdentifier,  rate: u64) {

        require!(esdt.is_valid() && esdt.is_egld() == false, "ESDT identifier is not valid");
        self.exchange_rate().set(rate);
        self.esdt_token().set(esdt);
    }

    #[payable("EGLD")]
    #[endpoint]
    fn deposit_egld(&self) {
        
        self.blockchain().check_caller_is_owner();
        let payment = self.call_value().egld_or_single_esdt();
        require!(payment.token_identifier.is_egld(), "Only EGLD accepted");
        require!(payment.amount > 0u32, "Payment must be more than 0");
    }

    #[payable("*")]
    #[endpoint]
    fn deposit_esdt(&self) {

        self.blockchain().check_caller_is_owner();
        let payment = self.call_value().egld_or_single_esdt();
        let esdt = self.esdt_token().get();

        require!(payment.token_identifier == esdt, "Wrong esdt token");
        require!(payment.amount > 0u32, "Must pay more than 0 tokens");
    }

    #[endpoint]
    fn claim_egld(&self, amount: OptionalValue<BigUint>) {

        self.blockchain().check_caller_is_owner();
        let payment = match amount {
            OptionalValue::Some(n) => n,
            OptionalValue::None => self.get_egld_balance()
        };
        let caller = self.blockchain().get_caller();
        require!(
            payment <= self.get_egld_balance(),
            "Contract does not have enough funds"
        );
        self.send().direct_egld(&caller, &payment);
        }

    #[endpoint]
    fn claim_esdt(&self, amount: OptionalValue<BigUint>) {

        self.blockchain().check_caller_is_owner();
        let payment = match amount {
            OptionalValue::Some(n) => n,
            OptionalValue::None => self.get_esdt_balance()
        };
        let caller = self.blockchain().get_caller();
        let esdt = self.esdt_token().get();
        require!(
            payment <= self.get_esdt_balance(),
            "Contract does not have enough funds"
        );
        self.send().direct(&caller, &esdt, 0, &payment);
        }

    #[endpoint]
    fn set_exchange_rate(&self, rate: u64) {

        self.blockchain().check_caller_is_owner();
        self.exchange_rate().set(rate);
    }

    #[payable("EGLD")]
    #[endpoint]
    fn egld_esdt_swap(&self) {
        let payment = self.call_value().egld_or_single_esdt();
        let rate = self.exchange_rate().get();
        require!(payment.token_identifier.is_egld(), "Only EGLD accepted");
        require!(payment.amount > 0u32, "Payment must be more than 0");

        let payment_back = payment.amount*rate;

        require!(
            payment_back <= self.get_esdt_balance(),
            "Contract does not have enough funds"
        );

        let caller = self.blockchain().get_caller();
        let esdt = self.esdt_token().get();
        self.send().direct(&caller, &esdt, 0, &payment_back);
    }

    #[payable("*")]
    #[endpoint]
    fn esdt_egld_swap(&self) {
        let payment = self.call_value().egld_or_single_esdt();
        let rate = self.exchange_rate().get();
        let esdt = self.esdt_token().get();

        require!(payment.token_identifier == esdt, "Wrong esdt token");
        require!(payment.amount > 0u32, "Must pay more than 0 tokens");

        let payment_back = payment.amount/rate;

        require!(
            payment_back <= self.get_egld_balance(),
            "Contract does not have enough funds"
        );

        let caller = self.blockchain().get_caller();
        self.send().direct_egld(&caller, &payment_back);
    }

    #[view(getEgldBalance)]
    fn get_egld_balance(&self) -> BigUint {
        self.blockchain().get_sc_balance(&EgldOrEsdtTokenIdentifier::egld(), 0)
    }

    #[view(getEsdtBalance)]
    fn get_esdt_balance(&self) -> BigUint {
        let esdt = self.esdt_token().get();
        self.blockchain().get_sc_balance(&esdt, 0)
    }

    #[view(getRate)]
    #[storage_mapper("exchange_rate")]
    fn exchange_rate(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("esdt_token")]
    fn esdt_token(&self) -> SingleValueMapper<EgldOrEsdtTokenIdentifier>;

}`
        }
    ],
    nftauction: [
        {
            input: [],
            title: "NFT Auction",
            description: "Let users bid on your NFT, the highest bid wins",
            longDescription: "The NFT-auction SC allows users to bid on your NFT. The way it works is pretty straigh forward: The person who bids the most wins your NFT. The bid has a starting price and a deadline.",
            icon: "bi bi-hammer",
            name: 'nftauction.rs',
            code: `#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TopEncode, TopDecode, TypeAbi, PartialEq, Eq, Clone, Copy, Debug)]
pub enum Status {
    BiddingPeriod,
    Ended,
}

#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi, PartialEq)]
pub struct Nft<M: ManagedTypeApi> {
    pub token_identifier: TokenIdentifier<M>,
    pub nonce: u64,
}

#[multiversx_sc::contract]
pub trait Auction {
    #[init]
    fn init(&self) {}

    #[payable("*")]
    #[endpoint]
    fn start_auction(&self, starting_price: BigUint, deadline: u64, nonce: u64) {

        let payment = self.call_value().single_esdt();
        let caller = self.blockchain().get_caller();

        require!(
            payment.token_identifier.is_valid_esdt_identifier(),
            "Invalid esdt"
        );

        require!(
            deadline > self.get_current_time(),
            "Deadline can't be in the past"
        );

        self.deadline().set(deadline);
        self.starting_price().set(starting_price.clone());
        self.last_price().set(starting_price);
        self.nft().set(&Nft{
            token_identifier: payment.token_identifier,
            nonce: nonce
        });
        self.owner().set(caller);
    }

    #[payable("EGLD")]
    #[endpoint]
    fn send_bid(&self) {

        let payment = self.call_value().egld_value();

        require!(
            self.status() == Status::BiddingPeriod,
            "Cannot bid after deadline"
        );

        require!(
            payment > self.starting_price().get(),
            "Bid must be greater than starting auction price"
        );

        require!(
            payment > self.last_price().get(),
            "Bid must be greater than last one"
        );

        let caller = self.blockchain().get_caller();

        if self.bid(&caller).is_empty() {

            self.last_price().set(payment.clone());
            self.bid(&caller).set(payment);
            self.winner().set(caller);
        } else {

            self.send().direct_egld(&caller, &self.bid(&caller).get());

            self.last_price().set(payment.clone());
            self.bid(&caller).set(payment);
            self.winner().set(caller);
        }
    }


    #[endpoint]
    fn claim(&self) {
        match self.status() {
            Status::BiddingPeriod => sc_panic!("Cannot claim before deadline"),
            Status::Ended => {

                let caller = self.blockchain().get_caller();
                
                if caller == self.winner().get() {

                    let nft = self.nft().get();
                    self.send().direct_esdt(&caller, &nft.token_identifier, nft.nonce, &BigUint::from(1u32));
                    self.bid(&caller).clear();
                } else if caller == self.owner().get() {

                    let amount = self.last_price().get();
                    self.send().direct_egld(&caller, &amount);
                    self.last_price().clear();
                } else {

                    let amount = self.bid(&caller).get();
                    self.send().direct_egld(&caller, &amount);
                    self.bid(&caller).clear();
                }
            },
        }
    }

    #[view(getStatus)]
    fn status(&self) -> Status {
        if self.get_current_time() < self.deadline().get() {
            Status::BiddingPeriod
        } else {
            Status::Ended
        }
    }

    fn get_current_time(&self) -> u64 {
        self.blockchain().get_block_timestamp()
    }

    #[storage_mapper("owner")]
    fn owner(&self) -> SingleValueMapper<ManagedAddress>;

    #[view(getStartingPrie)]
    #[storage_mapper("starting_rice")]
    fn starting_price(&self) -> SingleValueMapper<BigUint>;

    #[view(getLastPrice)]
    #[storage_mapper("last_price")]
    fn last_price(&self) -> SingleValueMapper<BigUint>;

    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;

    #[view(getBid)]
    #[storage_mapper("bid")]
    fn bid(&self, bidder: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[view(getNft)]
    #[storage_mapper("nft")]
    fn nft(&self) -> SingleValueMapper<Nft<Self::Api>>;

    #[view(getWinner)]
    #[storage_mapper("winner")]
    fn winner(&self) -> SingleValueMapper<ManagedAddress>;
}`
        }
    ],
    crowdfunding: [
        {
            input: [{
                label: "Target",
                datatype: "number"
            }, {
                label: "Deadline",
                datatype: "number"
            }],
            title: "Crowdfunding",
            description: "Raising funds up to a certain amount",
            longDescription: "The Crowdfunding SC is a decentralized tool that enables project creators to set up campaigns and investors to contribute with tokens. It offers transparency and customization options, making it a versatile and powerful way to raise funds.",
            icon: "bi bi-people-fill",
            name: 'crowdfunding.rs',
            code: `#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TopEncode, TopDecode, TypeAbi, PartialEq, Eq, Clone, Copy, Debug)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}

#[multiversx_sc::contract]
pub trait Crowdfunding {
    #[init]
    fn init(&self, target: BigUint, deadline: u64) {
        require!(target > 0, "Target must be more than 0");
        self.target().set(target);

        require!(
            deadline > self.get_current_time(),
            "Deadline can't be in the past"
        );
        self.deadline().set(deadline);
        self.successful_and_claim().set(false);
    }

    #[endpoint]
    #[payable("*")]
    fn fund(&self) {
        let payment = self.call_value().egld_value();

        require!(
            self.status() == Status::FundingPeriod,
            "Cannot fund after deadline"
        );

        let caller = self.blockchain().get_caller();
        self.deposit(&caller).update(|deposit| *deposit += payment);
    }

    #[view(getCurrentFunds)]
    fn get_current_funds(&self) -> BigUint {
        self.blockchain().get_sc_balance(&EgldOrEsdtTokenIdentifier::egld(), 0)
    }

    #[endpoint]
    fn claim(&self) {
        match self.status() {
            Status::FundingPeriod => sc_panic!("Cannot claim before deadline"),
            Status::Successful => {
                let caller = self.blockchain().get_caller();
                require!(
                    caller == self.blockchain().get_owner_address(),
                    "Only owner can claim successful funding"
                );
                let sc_balance = self.get_current_funds();
                self.send().direct_egld(&caller, &sc_balance);
                self.successful_and_claim().set(true);
            },
            Status::Failed => {
                let caller = self.blockchain().get_caller();
                let deposit = self.deposit(&caller).get();

                if deposit > 0u32 {
                    self.deposit(&caller).clear();
                    self.send().direct_egld(&caller, &deposit);
                }
            },
        }
    }

    #[view(getStatus)]
    fn status(&self) -> Status {
        if self.get_current_time() < self.deadline().get() {
            Status::FundingPeriod
        } else if self.get_current_funds() >= self.target().get() && self.successful_and_claim().get() == false {
            Status::Successful
        } else if self.successful_and_claim().get() == true {
            Status::Successful
        } else {
            Status::Failed
        }
    }

    fn get_current_time(&self) -> u64 {
        self.blockchain().get_block_timestamp()
    }

    #[view(getTarget)]
    #[storage_mapper("target")]
    fn target(&self) -> SingleValueMapper<BigUint>;

    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;

    #[view(getDeposit)]
    #[storage_mapper("deposit")]
    fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("successful_and_claim")]
    fn successful_and_claim(&self) -> SingleValueMapper<bool>;
}`
        }
    ],
    lottery: [
        {
            input: [],
            title: "Lottery",
            description: "Users buy tickets, only one wins",
            longDescription: "The Lottery SC enables users to purchase tickets for a chance to win a prize. The contract automatically selects a winner and distributes the prize, ensuring transparency and fairness.",
            icon: "bi bi-cash-coin",
            name: 'lottery.rs',
            code: `#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TopEncode, TopDecode, TypeAbi, PartialEq, Eq, Clone, Copy)]
pub enum Status {
    Running,
    Ended,
}

#[multiversx_sc::contract]
pub trait Lottery {

    #[init]
    fn init(&self) {}

    #[endpoint]
    fn start_lottery(
        &self,
        deadline: u64,
        ticket_price: BigUint,
        max_entries_per_user: u64,
    ) {

        self.blockchain().check_caller_is_owner();

        require!(
            deadline > self.get_current_time(),
            "Deadline can't be in the past"
        );
        require!(
            ticket_price > 0,
            "Ticket price must be higher than 0"
        );
        require!(
            max_entries_per_user > 0,
            "Max entries per user must be greater than 0"
        );
        require!(
            self.ongoing_lottery().get() == false,
            "There already is one lottery active"
        );

        self.deadline().set(deadline);
        self.ticket_price().set(ticket_price);
        self.max_entries_per_user().set(max_entries_per_user);
        self.ongoing_lottery().set(true);
    }

    #[payable("EGLD")]
    #[endpoint]
    fn buy_ticket(&self) {

        match self.status() {
            Status::Running => {

                let caller = self.blockchain().get_caller();
                let amount = self.call_value().egld_value();
        
                require!(
                    amount == self.ticket_price().get(),
                    "Transaction value does not match ticket price"
                );
        
                if self.participants().contains(&caller) {
                        
                    self.participants().insert(caller.clone());
                    self.user_entries(&caller).set(1);
                    self.entries().push(&caller);
        
                } else {
        
                    require!(
                        self.user_entries(&caller).get() <= self.max_entries_per_user().get(),
                        "Maximum entries for this address reached"
                    );
        
                    self.user_entries(&caller).update(|val| *val += 1);
                    self.entries().push(&caller);
                }
            },
            Status::Ended => {
                sc_panic!("Lottery entry period has ended")
            },
        };
    }

    #[endpoint]
    fn get_winner_and_send_prize(&self) {

        self.blockchain().check_caller_is_owner();

        let mut rand = RandomnessSource::new();
        let entries_number = self.entries().len();

        let winner_index = rand.next_usize_in_range(1, entries_number);
        let winner = self.entries().get(winner_index);
        let prize = self.blockchain().get_sc_balance(&EgldOrEsdtTokenIdentifier::egld(), 0);

        self.send().direct_egld(&winner, &prize);

        self.ongoing_lottery().set(false);
        self.participants().clear();
        self.entries().clear();
    }

    #[view(getStatus)]
    fn status(&self) -> Status {
        if self.get_current_time() < self.deadline().get() {
            Status::Running
        } else {
            Status::Ended
        }
    }

    fn get_current_time(&self) -> u64{

        let timestamp = self.blockchain().get_block_timestamp();

        timestamp
    }

    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;

    #[view(getTicketPrice)]
    #[storage_mapper("ticket_price")]
    fn ticket_price(&self) -> SingleValueMapper<BigUint>;

    #[view(getMaxEntries)]
    #[storage_mapper("max_entries_per_user")]
    fn max_entries_per_user(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("ongoing_lottery")]
    fn ongoing_lottery(&self) -> SingleValueMapper<bool>;

    #[view(getParticipants)]
    #[storage_mapper("participants")]
    fn participants(&self) -> UnorderedSetMapper<ManagedAddress>;

    #[view(getUserEntries)]
    #[storage_mapper("user_entries")]
    fn user_entries(&self, address: &ManagedAddress) -> SingleValueMapper<u64>;

    #[storage_mapper("entries")]
    fn entries(&self) -> VecMapper<ManagedAddress>;`
        }
    ],
    tokensminter: [
        {
            input: [],
            title: "Token Minter",
            description: "Create cryptocurrency with ERDT standard",
            longDescription: "The Token Minter SC allows for easy creation and distribution of customized tokens on the blockchain using the ERDT standard. It includes customizable parameters such as name, symbol and supply.",
            icon: "bi bi-coin",
            name: 'tokenminter.rs',
            code: `#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[multiversx_sc::contract]
pub trait TokenMinter {

    #[init]
    fn init(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn issue_token(
        &self,
        #[payment] issue_cost: BigUint,
        token_display_name: ManagedBuffer,
        token_ticker: ManagedBuffer,
        num_decimals: usize,
    ) {

        let caller = self.blockchain().get_caller();

        require!(
            issue_cost == BigUint::from(50000000000000000u64),
            "Wrong payment value. Must be 0.05 EGLD"
        );

        require!(
            self.has_token(&caller).get() != true,
            "A token was already issued by this address");

        self.token(&caller).issue_and_set_all_roles(
            issue_cost,
            token_display_name,
            token_ticker,
            num_decimals,
            core::prelude::v1::Some(self.callbacks().tm_callback(caller)),
        );
    }

    #[endpoint]
    fn claim_tokens(&self, initial_supply: BigUint,) {

        let caller = self.blockchain().get_caller();
        self.token(&caller).mint_and_send(&caller, initial_supply);
    }

    #[callback]
    fn tm_callback(
        &self,
        #[call_result] result: ManagedAsyncCallResult<TokenIdentifier>,
        caller: ManagedAddress,
    ) {
        match result {
            ManagedAsyncCallResult::Ok(token_id) => {
                if token_id.is_valid_esdt_identifier() {
                    self.token(&caller).set_token_id(token_id);
                    self.has_token(&caller).set(true);
                }
            }
            ManagedAsyncCallResult::Err(_) => {}
        }
    }

    #[storage_mapper("token")]
    fn token(&self, owner: &ManagedAddress) -> FungibleTokenMapper<Self::Api>;

    #[storage_mapper("has_token")]
    fn has_token(&self, owner: &ManagedAddress) -> SingleValueMapper<bool>;
}`
        }
    ],
    vote: [
        {
            input: [],
            title: "Vote",
            description: "Create and vote on proposals",
            longDescription: "The Vote Smart Contract enables transparent and secure voting on blockchain-based proposals. The transparency and security of the voting process, eliminating the need for intermediaries and ensuring that all votes are recorded immutably on the blockchain.",
            icon: "bi bi-person-vcard-fill",
            name: 'vote.rs',
            code: `#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TopEncode, TopDecode, TypeAbi, PartialEq, Eq, Clone, Copy)]
pub enum Status {
    Running,
    Ended,
}

#[derive(TopEncode, TopDecode, TypeAbi, PartialEq, Eq, Clone, NestedEncode, NestedDecode)]
pub struct Contents<M: ManagedTypeApi> {
    title: ManagedBuffer<M>,
    description: ManagedBuffer<M>,
    votes_for: u64,
    votes_against: u64,
}

#[multiversx_sc::contract]
pub trait Voting {

    #[init]
    fn init(&self) {}

    #[endpoint]
    fn start_vote(
        &self,
        deadline: u64,
        title: ManagedBuffer,
        description: ManagedBuffer,
    ) {

        self.blockchain().check_caller_is_owner();

        require!(
            deadline > self.get_current_time(),
            "Deadline can't be in the past"
        );
        require!(
            self.ongoing_vote().get() == false,
            "There is already one active"
        );

        self.deadline().set(deadline);
        self.ongoing_vote().set(true);

        self.content().set(&Contents{
            title: title,
            description: description,
            votes_for: 0,
            votes_against: 0,
        })
    }

    #[endpoint]
    fn vote(&self, vote: bool) {

        match self.status() {
            Status::Running => {

                let caller = self.blockchain().get_caller();
        
                require!(
                    vote == false || vote == true,
                    "Vote parameter format not valid"
                );

                require!(
                    self.participants().contains(&caller) == false,
                    "This address already voted"
                );
                
                if vote == true {
                    self.content().update(|instance| {instance.votes_for += 1})
                }
                else {
                    self.content().update(|instance| {instance.votes_against += 1})
                }

                self.participants().insert(caller.clone());
                self.votes(&caller).set(vote);

            },
            Status::Ended => {
                sc_panic!("Voting period has ended")
            },
        };
    }

    #[endpoint]
    fn secure_results(&self) {

        match self.status() {
            Status::Running => {

                sc_panic!("Voting period has not ended yet")

            },
            Status::Ended => {

                self.blockchain().check_caller_is_owner();

                let content = self.content().get();
                self.history().insert(Contents{
                    title: content.title,
                    description: content.description,
                    votes_for: content.votes_for,
                    votes_against: content.votes_against,
                });

                self.ongoing_vote().set(false);
                self.participants().clear();
            },
        };
    }

    #[view(getStatus)]
    fn status(&self) -> Status {
        if self.get_current_time() < self.deadline().get() {
            Status::Running
        } else {
            Status::Ended
        }
    }

    fn get_current_time(&self) -> u64{

        let timestamp = self.blockchain().get_block_timestamp();

        timestamp
    }

    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;

    #[view(getHistory)]
    #[storage_mapper("history")]
    fn history(&self) -> UnorderedSetMapper<Contents<Self::Api>>;

    #[view(getContent)]
    #[storage_mapper("content")]
    fn content(&self) -> SingleValueMapper<Contents<Self::Api>>;

    #[storage_mapper("ongoing_vote")]
    fn ongoing_vote(&self) -> SingleValueMapper<bool>;

    #[view(getParticipants)]
    #[storage_mapper("participants")]
    fn participants(&self) -> UnorderedSetMapper<ManagedAddress>;

    #[storage_mapper("votes")]
    fn votes(&self, person: &ManagedAddress) -> SingleValueMapper<bool>;
}`
        }
    ],
}