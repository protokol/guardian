import { Container, Contracts, Providers, Services } from "@arkecosystem/core-kernel";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces } from "@arkecosystem/crypto";

import { WalletDoesntHavePermissionsError } from "./errors";
import { GuardianGroupPermissionsHandler, GuardianUserPermissionsHandler } from "./handlers";
import { Identifiers } from "./interfaces";
import { PermissionResolver } from "./permission-resolver";
import { GuardianIndexers, guardianUserPermissionIndexer } from "./wallet-indexes";

const plugin = require("../package.json");

export class ServiceProvider extends Providers.ServiceProvider {
    public async register(): Promise<void> {
        const logger: Contracts.Kernel.Logger = this.app.get(Container.Identifiers.LogService);
        logger.info(`Loading plugin: ${plugin.name} with version ${plugin.version}.`);

        this.registerIndexers();

        this.app.bind(Container.Identifiers.TransactionHandler).to(GuardianUserPermissionsHandler);
        this.app.bind(Container.Identifiers.TransactionHandler).to(GuardianGroupPermissionsHandler);

        const cacheFactory: any = this.app.get(Container.Identifiers.CacheFactory);
        this.app
            .bind(Container.Identifiers.CacheService)
            .toConstantValue(await cacheFactory())
            .whenTargetTagged("cache", plugin.name);
        this.app.bind(Identifiers.PermissionsResolver).to(PermissionResolver).inSingletonScope();

        this.registerActions();
    }

    private registerIndexers() {
        this.app
            .bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex)
            .toConstantValue({
                name: GuardianIndexers.UserPermissionsIndexer,
                indexer: guardianUserPermissionIndexer,
                autoIndex: false,
            });
    }

    private registerActions(): void {
        this.app
            .get<Services.Triggers.Triggers>(Container.Identifiers.TriggerService)
            .get("verifyTransaction")
            .before(async (data: { handler: Handlers.TransactionHandler; transaction: Interfaces.ITransaction }) => {
                if (
                    !(await this.app.get<PermissionResolver>(Identifiers.PermissionsResolver).resolve(data.transaction))
                ) {
                    throw new WalletDoesntHavePermissionsError(data.transaction.type, data.transaction.typeGroup);
                }
            });
    }
}
