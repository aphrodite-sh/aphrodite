// SIGNED-SOURCE: <62bb992fef8867280e600ffa32360829>
/**
 * AUTO-GENERATED FILE
 * Do not modify. Update your schema and re-generate for changes.
 */
import * as impls from "../IdentityMutationsImpl.js";
import { ICreateOrUpdateBuilder } from "@aphro/runtime-ts";
import { Context } from "@aphro/runtime-ts";
import { MutationsBase } from "@aphro/runtime-ts";
import Identity from "../Identity.js";
import { default as spec } from "./IdentitySpec.js";
import { Data } from "./IdentityBase.js";
import { UpdateMutationBuilder } from "@aphro/runtime-ts";
import { CreateMutationBuilder } from "@aphro/runtime-ts";
import { DeleteMutationBuilder } from "@aphro/runtime-ts";
import { SID_of } from "@aphro/runtime-ts";
import { Changeset } from "@aphro/runtime-ts";

export type CreateArgs = { identifier: string; token: string };
class Mutations extends MutationsBase<Identity, Data> {
  constructor(ctx: Context, mutator: ICreateOrUpdateBuilder<Identity, Data>) {
    super(ctx, mutator);
  }

  create(args: CreateArgs): this {
    const extraChangesets = impls.createImpl(this.mutator, args);
    this.mutator.addExtraChangesets(extraChangesets || undefined);
    return this;
  }
}

export default {
  create(ctx: Context, args: CreateArgs): Mutations {
    return new Mutations(ctx, new CreateMutationBuilder(ctx, spec)).create(
      args
    );
  },
};
