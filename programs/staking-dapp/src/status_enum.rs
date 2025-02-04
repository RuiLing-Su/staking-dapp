use anchor_lang::prelude::*;
use borsh::{BorshSerialize, BorshDeserialize};

#[derive(Clone, AnchorSerialize, AnchorDeserialize, Debug, PartialEq)]
pub enum PackageStatus {
    Active,
    Completed,
    Withdrawn,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize, Debug, PartialEq)]
pub enum UserRole {
    User,
    ReferralMaster,
    TeamLeader,
    Admin,
}