
# BackEnd Engineer Case Challenge - HabariPay

In this challenge you will build a super simplified version of a Payment Service Provider (PSP) just like [**Squad**](https://squadco.com) and maybe learn a little more about how payments work in Nigeria.
Make sure you read the whole document carefully and follow the guidelines in it.

## Context

In essence, Squad as a PSP has two very important functions:

1. Allow merchants receive payments from their customers ("transactions")
2. Send payments to merchant's bank account ("pay-outs")

At HabariPay, we have two entities that represent this information:

* `transactions`: representing purchase information, card details, value, etc.
* `payouts`: represents the money that we paid out to the customer

> Note: When a customer completes a card transaction, we normally receive the money from the card processor (called a settlement) 
on average 1 day later (what we call T+1), because this is how the financial chain (issuer, acquirers) works. 
However, it is possible to receive money instantly through "Virtual Accounts". 
If you are curious, you can look at the product page, but this is not necessary to complete this challenge: https://squadco.com/other-products/#virtualAccounts

## Requirements

Fork this repo and create a service with the following requirements:

1. The service must process transactions for cards, receiving the following information:
    * Transaction value. Eg: `'5000'`
    * Transaction description. Eg: `'Airtime purchase'`
    * Card number. Eg: `'5555 5555 5555 4444'`
    * Name of cardholder. Eg: `'Victor Anuebunwa'`
    * Card expiration date. Eg: `'06/23'`
    * Card verification code (CVV). Eg: `'373'`
    * Currency. Eg: `'NGN'`
2. The service must process transactions for Virtual Accounts, receiving the following information:
   * Transaction value
   * Transaction description. Eg: `'Data purchase'`
   * Customer Account Name. Eg: `'John Babawale'`
   * Customer Account Number. Eg: `'5555555555'`
   * Customer Bank code. Eg: `'058'`
   * Currency. Eg: `'USD'`
3. The transactions should maintain a unique reference.
4. The service must create the customer's transactions, with the following rules:
   * If the transaction is made with a virtual account:
      * Set status = `success` (indicating that the transaction was received and settled)
      * Set fee to be 5%
   * If the transaction is made with a card:
      * Set status = `pending` (indicating that the transaction was received but not settled)
      * Set fee to be 3%
5. The service must process settlement requests from card processors. This should update the status of transaction matching the transaction reference to `success`. Assume you will get the following information from the card processor:
   * Transaction amount. Eg: `'5000'`
   * Transaction reference. Eg: `'Bweh-4b39-2nj4-432'` (Matching a existing card transaction)
   * Card number. Eg: `'5555 5555 5555 4444'`
   * Currency. Eg: `'NGN'`
6. The service must return a list of transactions already created.
7. As the card number is sensitive information, the service can only store and return the last 4 digits of the card.
8. The service must be able to create payouts. The amount should be a lump-sum of all settled transaction value.
9. When creating payouts, the processing fee must also be deducted. 
Ex: if the rate is 5% and the merchant received a transaction worth N100.00, he will only receive N95.00. Consider the following fees:
    * 3% for transactions made with a card
    * 5% for transactions made with a Virtual Accounts
10. The service must provide a means of consultation for the merchant to view their balance with the following information:
     * `available` balance: Total of every settled transaction the merchant has received (minus payouts)
     * `pending_settlement` balance: Total of every pending transaction

## Restrictions

1. The service must be written in Node.js
2. The service must store information in a database. Here at HabariPay we widely use PostgreSQL
3. The project must contain automated tests satisfying all the requirements.

## Notes
- This repo contains a simple code template to quickly get you started, but feel free to replace as much as you like.
- You don't need to worry about authentication, installments or recurring payments.
- You can install any necessary module you wish to use, no side-eyes.

## How to submit

1. The challenge must be sent to the HR person contacting you, in the form of a link to a public repository
2. We will evaluate you based on the service architecture, code quality, understanding of requirements, and how prepared this service would be to be run in production.
3. After receiving the submission, we will call you to talk to the team, present the challenge and discuss the decisions you made.
4. We are also open to talk about how we can improve on this service.
5. We think that **1 week** is an ok amount of time to do the challenge, but we know that not everyone has the same level of availability. So let us know if you need more time, okay?
6. Good luck :)
