use anchor_lang::prelude::*;

declare_id!("3TWd8F2kC9NoDPteeRibPLWXYTBEyFxgPxCbxHybk8VS");

#[program]
pub mod verigrad {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
