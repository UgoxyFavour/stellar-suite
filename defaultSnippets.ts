export interface UserSnippet {
  id: string;
  prefix: string;
  label: string;
  description: string;
  body: string;
}

/**
 * Default advanced snippets provided out of the box.
 */
export const DEFAULT_SNIPPETS: UserSnippet[] = [
  {
    id: 'default-contract',
    prefix: 'scontract',
    label: 'Soroban Contract',
    description: 'Basic Soroban contract scaffold',
    body: [
      '#![no_std]',
      'use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short};',
      '',
      '#[contract]',
      'pub struct ${1:ContractName};',
      '',
      '#[contractimpl]',
      'impl ${1:ContractName} {',
      '    pub fn hello(env: Env, to: Symbol) -> Symbol {',
      '        symbol_short!("Hello")',
      '    }',
      '}'
    ].join('\n')
  },
  {
    id: 'default-upgradeable',
    prefix: 'supgrade',
    label: 'Upgradeable Contract',
    description: 'Soroban upgradeable contract pattern',
    body: [
      'pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {',
      '    // Ensure only authorized admin can call this',
      '    let admin: Address = env.storage().instance().get(&Symbol::short("admin")).unwrap();',
      '    admin.require_auth();',
      '',
      '    // Update the contract code',
      '    env.deployer().update_current_contract_wasm(new_wasm_hash);',
      '}',
      '$0'
    ].join('\n')
  }
];

export const SNIPPET_PLACEHOLDERS = ['${1:Name}', '${2:Value}', '$0'];