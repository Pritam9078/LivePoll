#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, log, map, symbol_short, token, Address, Env, Map, Symbol,
};

// Storage keys
const TOTAL_YES: Symbol = symbol_short!("TOTAL_YES");
const TOTAL_NO: Symbol = symbol_short!("TOTAL_NO");
const VOTERS: Symbol = symbol_short!("VOTERS");

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    /// Cast a vote: true = YES, false = NO
    /// Prevents double voting by the same address.
    pub fn vote(env: Env, voter: Address, choice: bool) {
        // Require the voter to authorize this call
        voter.require_auth();

        // Load existing voters map (or create empty one)
        let mut voters: Map<Address, bool> = env
            .storage()
            .instance()
            .get(&VOTERS)
            .unwrap_or(map![&env]);

        // Prevent double voting
        if voters.contains_key(voter.clone()) {
            panic!("Already voted");
        }

        // Get current counts
        let mut yes: u32 = env
            .storage()
            .instance()
            .get(&TOTAL_YES)
            .unwrap_or(0u32);
        let mut no: u32 = env
            .storage()
            .instance()
            .get(&TOTAL_NO)
            .unwrap_or(0u32);

        // Apply vote
        if choice {
            yes = yes.checked_add(1).unwrap();
        } else {
            no = no.checked_add(1).unwrap();
        }

        // Persist voter record
        voters.set(voter.clone(), choice);

        // Save to storage
        env.storage().instance().set(&VOTERS, &voters);
        env.storage().instance().set(&TOTAL_YES, &yes);
        env.storage().instance().set(&TOTAL_NO, &no);

        // Extend instance TTL (1 year worth of ledgers ≈ 6,300,000)
        env.storage().instance().extend_ttl(100, 6_300_000);

        // Emit event: ("vote", "cast") with data tuple
        env.events().publish(
            (symbol_short!("vote"), symbol_short!("cast")),
            (voter, choice, yes, no),
        );
    }

    /// Returns (yes_votes, no_votes)
    pub fn get_results(env: Env) -> (u32, u32) {
        let yes: u32 = env
            .storage()
            .instance()
            .get(&TOTAL_YES)
            .unwrap_or(0u32);
        let no: u32 = env
            .storage()
            .instance()
            .get(&TOTAL_NO)
            .unwrap_or(0u32);
        (yes, no)
    }
}

// ============================================================
// TESTS
// ============================================================
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{vec, Env};

    fn create_contract(env: &Env) -> PollContractClient {
        let contract_id = env.register_contract(None, PollContract);
        PollContractClient::new(env, &contract_id)
    }

    /// Test 1: Initial state should be (0, 0)
    #[test]
    fn test_initial_state() {
        let env = Env::default();
        let contract = create_contract(&env);

        let (yes, no) = contract.get_results();
        assert_eq!(yes, 0, "Initial YES votes should be 0");
        assert_eq!(no, 0, "Initial NO votes should be 0");
    }

    /// Test 2: Voting YES increments count correctly
    #[test]
    fn test_vote_yes() {
        let env = Env::default();
        env.mock_all_auths();
        let contract = create_contract(&env);

        let voter = Address::generate(&env);
        contract.vote(&voter, &true);

        let (yes, no) = contract.get_results();
        assert_eq!(yes, 1, "YES votes should be 1 after voting YES");
        assert_eq!(no, 0, "NO votes should still be 0");
    }

    /// Test 3: Double voting by same address should panic
    #[test]
    #[should_panic(expected = "Already voted")]
    fn test_double_vote_prevention() {
        let env = Env::default();
        env.mock_all_auths();
        let contract = create_contract(&env);

        let voter = Address::generate(&env);
        // First vote — should succeed
        contract.vote(&voter, &true);
        // Second vote — should panic
        contract.vote(&voter, &false);
    }

    /// Bonus Test 4: Voting NO increments NO count correctly
    #[test]
    fn test_vote_no() {
        let env = Env::default();
        env.mock_all_auths();
        let contract = create_contract(&env);

        let voter = Address::generate(&env);
        contract.vote(&voter, &false);

        let (yes, no) = contract.get_results();
        assert_eq!(yes, 0, "YES votes should still be 0");
        assert_eq!(no, 1, "NO votes should be 1 after voting NO");
    }

    /// Bonus Test 5: Multiple different voters can vote
    #[test]
    fn test_multiple_voters() {
        let env = Env::default();
        env.mock_all_auths();
        let contract = create_contract(&env);

        let voter1 = Address::generate(&env);
        let voter2 = Address::generate(&env);
        let voter3 = Address::generate(&env);

        contract.vote(&voter1, &true);
        contract.vote(&voter2, &true);
        contract.vote(&voter3, &false);

        let (yes, no) = contract.get_results();
        assert_eq!(yes, 2, "YES should be 2");
        assert_eq!(no, 1, "NO should be 1");
    }
}
