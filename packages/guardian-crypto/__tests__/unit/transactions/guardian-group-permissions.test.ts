import "jest-extended";

import { passphrases } from "@arkecosystem/core-test-framework";
import { Errors, Managers, Transactions } from "@arkecosystem/crypto";

import { GuardianGroupPermissionsBuilder } from "../../../src/builders";
import { IGuardianGroupPermissionsAsset } from "../../../src/interfaces";
import { GuardianGroupPermissionsTransaction } from "../../../src/transactions";

const groupPermission = {
    name: "group name",
    priority: 1,
    default: false,
    active: true,
    allow: [{ transactionType: 9000, transactionTypeGroup: 0 }],
    deny: [{ transactionType: 9000, transactionTypeGroup: 1 }],
};

describe("Guardian set group permissions tests", () => {
    Managers.configManager.setFromPreset("testnet");
    Managers.configManager.setHeight(2);
    Transactions.TransactionRegistry.registerTransactionType(GuardianGroupPermissionsTransaction);

    describe("Ser/deser tests", () => {
        it("should ser/deser correctly with allow/deny permissions", () => {
            const actual = new GuardianGroupPermissionsBuilder()
                .GuardianGroupPermissions(groupPermission)
                .nonce("4")
                .sign(passphrases[0]!)
                .getStruct();

            const serialized = Transactions.Utils.toBytes(actual);
            const deserialized = Transactions.Deserializer.deserialize(serialized);

            expect(deserialized.data.asset!.setGroupPermissions).toStrictEqual(groupPermission);
            expect(() => {
                Transactions.TransactionFactory.fromBytes(serialized);
            }).not.toThrow();
        });

        it("should throw if there are duplicates in deny/allow permissions", () => {
            const groupPermissions: IGuardianGroupPermissionsAsset = {
                ...groupPermission,
                deny: groupPermission.allow,
            };

            const actual = new GuardianGroupPermissionsBuilder()
                .GuardianGroupPermissions(groupPermissions)
                .nonce("4")
                .sign(passphrases[0]!)
                .getStruct();

            expect(() => {
                const serialized = Transactions.Utils.toBytes(actual);
                Transactions.TransactionFactory.fromBytes(serialized);
            }).toThrowError(Errors.TransactionSchemaError);
        });

        it("should throw if there are duplicates in allow permissions", () => {
            const groupPermissions: IGuardianGroupPermissionsAsset = {
                ...groupPermission,
                allow: [...groupPermission.allow, ...groupPermission.allow],
            };

            const actual = new GuardianGroupPermissionsBuilder()
                .GuardianGroupPermissions(groupPermissions)
                .nonce("4")
                .sign(passphrases[0]!)
                .getStruct();

            expect(() => {
                const serialized = Transactions.Utils.toBytes(actual);
                Transactions.TransactionFactory.fromBytes(serialized);
            }).toThrowError(Errors.TransactionSchemaError);
        });

        it("should ser/deser correctly without allow/deny permissions", () => {
            const groupPermissions: IGuardianGroupPermissionsAsset = { ...groupPermission };
            delete groupPermissions.allow;
            delete groupPermissions.deny;

            const actual = new GuardianGroupPermissionsBuilder()
                .GuardianGroupPermissions(groupPermissions)
                .nonce("4")
                .sign(passphrases[0]!)
                .getStruct();

            const serialized = Transactions.Utils.toBytes(actual);
            const deserialized = Transactions.Deserializer.deserialize(serialized);

            expect(deserialized.data.asset!.setGroupPermissions).toStrictEqual(groupPermissions);
            expect(() => {
                Transactions.TransactionFactory.fromBytes(serialized);
            }).not.toThrow();
        });

        it("should ser/deser correctly with only allow permissions", () => {
            const groupPermissions: IGuardianGroupPermissionsAsset = { ...groupPermission };
            delete groupPermissions.deny;

            const actual = new GuardianGroupPermissionsBuilder()
                .GuardianGroupPermissions(groupPermissions)
                .nonce("4")
                .sign(passphrases[0]!)
                .getStruct();

            const serialized = Transactions.Utils.toBytes(actual);
            const deserialized = Transactions.Deserializer.deserialize(serialized);

            expect(deserialized.data.asset!.setGroupPermissions).toStrictEqual(groupPermissions);
            expect(() => {
                Transactions.TransactionFactory.fromBytes(serialized);
            }).not.toThrow();
        });

        it("should throw if asset is undefined", () => {
            const actual = new GuardianGroupPermissionsBuilder().GuardianGroupPermissions(groupPermission).nonce("3");

            actual.data.asset = undefined;
            expect(() => actual.sign(passphrases[0]!)).toThrow();
        });
    });
});
