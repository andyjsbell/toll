/* global web3 assert artifacts contract describe before beforeEach it */
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");

// This is where you write your test scenarios as per the README.
const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");
const { fromWei, padLeft, toBN } = web3.utils;

contract("Scenarios", function(accounts) {

    let owner0, owner1,
        booth0, booth1, booth2,
        vehicle0, vehicle1;
    const addressZero = padLeft(0, 40);
    const price01 = randomIntIn(1, 1000);
    const deposit0 = price01 + randomIntIn(1, 1000);
    const deposit1 = deposit0 + randomIntIn(1, 1000);
    const vehicleType0 = randomIntIn(1, 1000);
    const vehicleType1 = vehicleType0 + randomIntIn(1, 1000);
    const multiplier0 = randomIntIn(1, 1000);
    const multiplier1 = multiplier0 + randomIntIn(1, 1000);
    const tmpSecret = randomIntIn(1, 1000);
    const secret0 = toBytes32(tmpSecret);
    const secret1 = toBytes32(tmpSecret + randomIntIn(1, 1000));
    
    before("should prepare", async function() {
        assert.isAtLeast(accounts.length, 8);
        [ owner0, owner1, booth0, booth1, booth2, vehicle0, vehicle1 ] = accounts;
        const owner0Bal = await web3.eth.getBalance(owner0);
        assert.isAtLeast(parseInt(fromWei(owner0Bal)), 10);
    });

    beforeEach("should deploy regulator and operator", async function() {
        regulator = await Regulator.new({ from: owner0 });
        await regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 });
        await regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 });
        const txObj = await regulator.createNewOperator(owner1, deposit0, { from: owner0 });
        operator = await TollBoothOperator.at(txObj.logs[1].args.newOperator);
        await operator.addTollBooth(booth0, { from: owner1 });
        await operator.addTollBooth(booth1, { from: owner1 });
        await operator.addTollBooth(booth2, { from: owner1 });
        await operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 });
        await operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 });
        // await operator.setRoutePrice(booth0, booth1, price01, { from: owner1 });
        await operator.setPaused(false, { from: owner1 });
        hashed0 = await operator.hashSecret(secret0);
        hashed1 = await operator.hashSecret(secret1);
    });

    // Add as many `before`, `beforeEach`, `describe`, `afterEach`, `after` as you want.
    // But no additional `it`.

    //   * Scenario 1:
    //   * `vehicle1` enters at `booth1` and deposits required amount (say 10).
    //   * `vehicle1` exits at `booth2`, which route price happens to equal the deposit amount (so 10).
    //   * `vehicle1` gets no refund.
    it("scenario 1", async function() {
        // Set route price to deposit sent at 'booth1'
        const result = await operator.setRoutePrice.call(booth0, booth1, deposit0 + 1, { from: owner1 });
        assert.isTrue(result);
        const txObj = await operator.setRoutePrice(booth0, booth1, deposit0 + 1, { from: owner1 });
        assert.strictEqual(txObj.logs.length, 1);
        const logRoutePriceSet = txObj.logs[0];
        assert.strictEqual(logRoutePriceSet.event, "LogRoutePriceSet");
        assert.strictEqual(logRoutePriceSet.args.sender, owner1);
        assert.strictEqual(logRoutePriceSet.args.entryBooth, booth0);
        assert.strictEqual(logRoutePriceSet.args.exitBooth, booth1);
        assert.strictEqual(logRoutePriceSet.args.priceWeis.toNumber(), deposit0 + 1);

        // Enter road with deposit equal to route price
        const result1 = await operator.enterRoad.call(booth0, hashed0, {from:vehicle0, value:(deposit0 + 1) * multiplier0});
        assert.isTrue(result1);

        const txObj1 = await operator.enterRoad(booth0, hashed0, {from:vehicle0, value:(deposit0 + 1) * multiplier0});
        assert.strictEqual(txObj1.logs.length, 1);
        const logEntered = txObj1.logs[0];
        assert.strictEqual(logEntered.event, "LogRoadEntered");
        assert.strictEqual(logEntered.args.vehicle, vehicle0);
        assert.strictEqual(logEntered.args.entryBooth, booth0);
        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
        assert.strictEqual(logEntered.args.multiplier.toNumber(), multiplier0);
        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 + 1) * multiplier0);

        const result2 = await operator.reportExitRoad.call(secret0, { from: booth1 });
        assert.strictEqual(result2.toNumber(), 1);
        const txObj2 = await operator.reportExitRoad(secret0, { from: booth1 });
        assert.strictEqual(txObj2.receipt.logs.length, 1);
        assert.strictEqual(txObj2.logs.length, 1);
        const logExited = txObj2.logs[0];
        assert.strictEqual(logExited.event, "LogRoadExited");
        assert.strictEqual(logExited.args.exitBooth, booth1);
        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 + 1) * multiplier0);
        // No refund
        assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
    });

    //   * Scenario 2:
    //   * `vehicle1` enters at `booth1` and deposits required amount (say 10).
    //   * `vehicle1` exits at `booth2`, which route price happens to be more than the deposit amount (say 15).
    //   * `vehicle1` gets no refund.
    it("scenario 2", async function() {
        // Set route price to deposit sent at 'booth1'
        const result = await operator.setRoutePrice.call(booth0, booth1, (deposit0 + 2), { from: owner1 });
        assert.isTrue(result);
        const txObj = await operator.setRoutePrice(booth0, booth1, (deposit0 + 2), { from: owner1 });
        assert.strictEqual(txObj.logs.length, 1);
        const logRoutePriceSet = txObj.logs[0];
        assert.strictEqual(logRoutePriceSet.event, "LogRoutePriceSet");
        assert.strictEqual(logRoutePriceSet.args.sender, owner1);
        assert.strictEqual(logRoutePriceSet.args.entryBooth, booth0);
        assert.strictEqual(logRoutePriceSet.args.exitBooth, booth1);
        assert.strictEqual(logRoutePriceSet.args.priceWeis.toNumber(), (deposit0 + 2));

        // Enter road with deposit
        const result1 = await operator.enterRoad.call(booth0, hashed0, {from:vehicle0, value:(deposit0 + 1) * multiplier0});
        assert.isTrue(result1);

        const txObj1 = await operator.enterRoad(booth0, hashed0, {from:vehicle0, value:(deposit0 + 1) * multiplier0});
        assert.strictEqual(txObj1.logs.length, 1);
        const logEntered = txObj1.logs[0];
        assert.strictEqual(logEntered.event, "LogRoadEntered");
        assert.strictEqual(logEntered.args.vehicle, vehicle0);
        assert.strictEqual(logEntered.args.entryBooth, booth0);
        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
        assert.strictEqual(logEntered.args.multiplier.toNumber(), multiplier0);
        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 + 1) * multiplier0);

        const result2 = await operator.reportExitRoad.call(secret0, { from: booth1 });
        assert.strictEqual(result2.toNumber(), 1);
        const txObj2 = await operator.reportExitRoad(secret0, { from: booth1 });
        assert.strictEqual(txObj2.receipt.logs.length, 1);
        assert.strictEqual(txObj2.logs.length, 1);
        const logExited = txObj2.logs[0];
        assert.strictEqual(logExited.event, "LogRoadExited");
        assert.strictEqual(logExited.args.exitBooth, booth1);
        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
        // We are charged the deposit and not route price
        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 + 1) * multiplier0);
        // No refund
        assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
    });

    //   * Scenario 3:
    //   * `vehicle1` enters at `booth1` and deposits required amount (say 10).
    //   * `vehicle1` exits at `booth2`, which route price happens to be less than the deposit amount (say 6).
    //   * `vehicle1` gets refunded the difference (so 4).
    it("scenario 3", async function() {
        // Set route price to deposit sent at 'booth1'
        const difference = 2;
        const result = await operator.setRoutePrice.call(booth0, booth1, (deposit0 - difference), { from: owner1 });
        assert.isTrue(result);
        const txObj = await operator.setRoutePrice(booth0, booth1, (deposit0 - difference), { from: owner1 });
        assert.strictEqual(txObj.logs.length, 1);
        const logRoutePriceSet = txObj.logs[0];
        assert.strictEqual(logRoutePriceSet.event, "LogRoutePriceSet");
        assert.strictEqual(logRoutePriceSet.args.sender, owner1);
        assert.strictEqual(logRoutePriceSet.args.entryBooth, booth0);
        assert.strictEqual(logRoutePriceSet.args.exitBooth, booth1);
        assert.strictEqual(logRoutePriceSet.args.priceWeis.toNumber(), (deposit0 - difference));

        // Enter road with deposit
        const result1 = await operator.enterRoad.call(booth0, hashed0, {from:vehicle0, value:deposit0 * multiplier0});
        assert.isTrue(result1);

        const txObj1 = await operator.enterRoad(booth0, hashed0, {from:vehicle0, value:deposit0 * multiplier0});
        assert.strictEqual(txObj1.logs.length, 1);
        const logEntered = txObj1.logs[0];
        assert.strictEqual(logEntered.event, "LogRoadEntered");
        assert.strictEqual(logEntered.args.vehicle, vehicle0);
        assert.strictEqual(logEntered.args.entryBooth, booth0);
        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
        assert.strictEqual(logEntered.args.multiplier.toNumber(), multiplier0);
        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), deposit0 * multiplier0);

        const result2 = await operator.reportExitRoad.call(secret0, { from: booth1 });
        assert.strictEqual(result2.toNumber(), 1);
        const txObj2 = await operator.reportExitRoad(secret0, { from: booth1 });
        assert.strictEqual(txObj2.receipt.logs.length, 1);
        assert.strictEqual(txObj2.logs.length, 1);
        const logExited = txObj2.logs[0];
        assert.strictEqual(logExited.event, "LogRoadExited");
        assert.strictEqual(logExited.args.exitBooth, booth1);
        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
        // We are charged the deposit and not route price
        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 - difference) * multiplier0);
        // No refund
        assert.strictEqual(logExited.args.refundWeis.toNumber(), difference * multiplier0);
    });


    //   * Scenario 4:
    //   * `vehicle1` enters at `booth1` and deposits (say 14) more than the required amount (say 10).
    //   * `vehicle1` exits at `booth2`, which route price happens to equal the deposit amount (so 10).
    //   * `vehicle1` gets refunded the difference (so 4).
    it("scenario 4", async function() {

    });

    //   * Scenario 5:
    //   * `vehicle1` enters at `booth1` and deposits (say 14) more than the required amount (say 10).
    //   * `vehicle1` exits at `booth2`, which route price happens to be unknown.
    //   * the operator's owner updates the route price, which happens to be less than the deposited amount (say 11).
    //   * `vehicle1` gets refunded the difference (so 3).
    it("scenario 5", async function() {
    
    });

    //   * Scenario 6:
    //   * `vehicle1` enters at `booth1` and deposits more (say 14) than the required amount (say 10).
    //   * `vehicle1` exits at `booth2`, which route price happens to be unknown.
    //   * `vehicle2` enters at `booth1` and deposits the exact required amount (so 10).
    //   * `vehicle2` exits at `booth2`, which route price happens to be unknown.
    //   * the operator's owner updates the route price, which happens to be less than the required deposit (so 6).
    //   * `vehicle1` gets refunded the difference (so 8).
    //   * someone (anyone) calls to clear one pending payment.
    //   * `vehicle2` gets refunded the difference (so 4).
    it("scenario 6", async function() {

    });

});
