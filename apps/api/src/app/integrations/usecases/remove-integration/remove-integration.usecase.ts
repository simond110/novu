import { Injectable, Scope } from '@nestjs/common';
import { IntegrationRepository, DalException } from '@novu/dal';
import { buildIntegrationKey, InvalidateCacheService } from '@novu/application-generic';

import { RemoveIntegrationCommand } from './remove-integration.command';
import { ApiException } from '../../../shared/exceptions/api.exception';

@Injectable({
  scope: Scope.REQUEST,
})
export class RemoveIntegration {
  constructor(private invalidateCache: InvalidateCacheService, private integrationRepository: IntegrationRepository) {}

  async execute(command: RemoveIntegrationCommand) {
    try {
      // TODO: We should check first if the Integration exists in the database
      await this.invalidateCache.invalidateQuery({
        key: buildIntegrationKey().invalidate({
          _organizationId: command.organizationId,
        }),
      });

      await this.integrationRepository.delete({ _environmentId: command.environmentId, _id: command.integrationId });
    } catch (e) {
      if (e instanceof DalException) {
        throw new ApiException(e.message);
      }
      throw e;
    }

    return await this.integrationRepository.find({
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
    });
  }
}
