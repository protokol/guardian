import { Interfaces, Transactions } from "@arkecosystem/crypto";

import { defaults } from "../defaults";
import { GuardianTransactionGroup } from "../enums";

export abstract class GuardianBaseTransactionBuilder<
    TBuilder extends Transactions.TransactionBuilder<TBuilder>,
> extends Transactions.TransactionBuilder<TBuilder> {
    protected constructor() {
        super();
        this.data.version = defaults.version;
        this.data.typeGroup = GuardianTransactionGroup;
    }

    public override getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        struct.vendorField = this.data.vendorField;

        return struct;
    }
}
