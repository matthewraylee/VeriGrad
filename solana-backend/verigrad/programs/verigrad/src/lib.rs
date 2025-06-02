use anchor_lang::prelude::*;

declare_id!("BstGvvP7WHFodit1KdrzkyEoqQRyT5LfRzKxL6wmw6N6");

#[program]
pub mod verigrad {
    use super::*;

    pub fn issue_diploma(
        ctx: Context<IssueDiploma>,
        student_name: String,
        degree: String,
        graduation_year: u16,
    ) -> Result<()> {
        let diploma = &mut ctx.accounts.diploma;
        diploma.issuer = ctx.accounts.issuer.key();
        diploma.student = ctx.accounts.student.key();
        diploma.student_name = student_name;
        diploma.degree = degree;
        diploma.graduation_year = graduation_year;
        diploma.issued_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct IssueDiploma<'info> {
    #[account(init, payer = issuer, space = 8 + 32 + 32 + 64 + 64 + 2 + 8)]
    pub diploma: Account<'info, Diploma>,
    #[account(mut)]
    pub issuer: Signer<'info>,
    /// CHECK: This is the student receiving the diploma
    pub student: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Diploma {
    pub issuer: Pubkey,
    pub student: Pubkey,
    pub student_name: String,
    pub degree: String,
    pub graduation_year: u16,
    pub issued_at: i64,
}