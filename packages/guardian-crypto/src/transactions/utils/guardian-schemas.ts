import { Validation } from "@arkecosystem/crypto";

import { defaults } from "../../defaults";

export const amountSchema = { bignumber: { minimum: 0, maximum: 0 } };

export const vendorFieldSchema = { anyOf: [{ type: "null" }, { type: "string", format: "vendorField" }] };

export const groupNameSchema = {
    type: "string",
    minLength: defaults.guardianGroupName.minLength,
    maxLength: defaults.guardianGroupName.maxLength,
};

export const permissionsSchema = {
    type: "array",
    uniqueItems: true,
    items: {
        type: "object",
        required: ["transactionType", "transactionTypeGroup"],
        properties: {
            transactionType: { type: "integer", minimum: 0 },
            transactionTypeGroup: { type: "integer", minimum: 0 },
        },
    },
};

Validation.validator.removeKeyword("uniqueAllowDeny");
Validation.validator.addKeyword("uniqueAllowDeny", {
    compile:
        () =>
        ({ allow, deny }) => {
            if (!(allow && deny)) return true;

            const isDuplicate = allow.some((a) =>
                deny.some(
                    (d) => a.transactionType === d.transactionType && a.transactionTypeGroup === d.transactionTypeGroup,
                ),
            );
            return !isDuplicate;
        },
    errors: true,
    metaSchema: {
        type: "boolean",
    },
});
