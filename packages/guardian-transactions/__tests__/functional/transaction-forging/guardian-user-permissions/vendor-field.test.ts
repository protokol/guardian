import "@arkecosystem/core-test-framework/dist/matchers";

import { Contracts } from "@arkecosystem/core-kernel";
import { passphrases, snoozeForBlock } from "@arkecosystem/core-test-framework";
import { Enums } from "@protokol/guardian-crypto";

import * as support from "../__support__";
import { GuardianTransactionFactory } from "../__support__/transaction-factory";

const userPermissionsAsset = {
    groupNames: ["group name"],
    publicKey: "02def27da9336e7fbf63131b8d7e5c9f45b296235db035f1f4242c507398f0f21d",
    allow: [
        {
            transactionType: Enums.GuardianTransactionTypes.GuardianSetGroupPermissions,
            transactionTypeGroup: Enums.GuardianTransactionGroup,
        },
    ],
};

const groupPermissionsAsset = {
    name: "group name",
    priority: 1,
    default: false,
    active: true,
    allow: [
        {
            transactionType: Enums.GuardianTransactionTypes.GuardianSetGroupPermissions,
            transactionTypeGroup: Enums.GuardianTransactionGroup,
        },
    ],
};

let app: Contracts.Kernel.Application;
beforeAll(async () => (app = await support.setUp()));
afterAll(async () => await support.tearDown());

describe("Guardian set user permissions functional tests - with VendorField", () => {
    describe("Signed with one passphrase", () => {
        it("should broadcast, accept and forge it [Signed with 1 Passphrase]", async () => {
            // Set group permissions
            const setGroupPermissions = GuardianTransactionFactory.initialize(app)
                .GuardianSetGroupPermissions(groupPermissionsAsset)
                .withVendorField("VendorField test -> [GuardianGroupPermissions]")
                .withPassphrase(passphrases[0]!)
                .createOne();

            await expect(setGroupPermissions).toBeAccepted();
            await snoozeForBlock(1);
            await expect(setGroupPermissions.id).toBeForged();

            // Set user permissions
            const setUserPermissions = GuardianTransactionFactory.initialize(app)
                .GuardianSetUserPermissions(userPermissionsAsset)
                .withVendorField("VendorField test -> [GuardianUserPermissions]")
                .withPassphrase(passphrases[0]!)
                .createOne();

            await expect(setUserPermissions).toBeAccepted();
            await snoozeForBlock(1);
            await expect(setUserPermissions.id).toBeForged();
        });
    });
});
