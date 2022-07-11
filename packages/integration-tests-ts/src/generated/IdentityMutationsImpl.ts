import { CreateArgs } from "./IdentityMutations.js";
import { Changeset } from "@aphro/runtime-ts";
import { Data } from "./Identity.js";
import Identity from "./Identity.js";
import { IMutationBuilder } from "@aphro/runtime-ts";

export function createImpl(
  mutator: Omit<IMutationBuilder<Identity, Data>, "toChangeset">,
  { identifier, token }: CreateArgs
): void | Changeset<any>[] {
  // Use the provided mutator to make your desired changes.
  // e.g., mutator.set({name: "Foo" });
  // You do not need to return anything from this method. The mutator will track your changes.
  // If you do return changesets, those changesets will be applied in addition to the changes made to the mutator.
  throw new Error(
    "You must implement the mutation create for schema Identity in IdentityMutationsImpl.ts"
  );
}
