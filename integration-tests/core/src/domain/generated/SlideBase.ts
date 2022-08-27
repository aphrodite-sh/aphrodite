// SIGNED-SOURCE: <6ecb83f7d905eaebd2295a1383155dd5>
/**
 * AUTO-GENERATED FILE
 * Do not modify. Update your schema and re-generate for changes.
 */
import Slide from "../Slide.js";
import { default as s } from "./SlideSpec.js";
import { P } from "@aphro/runtime-ts";
import { UpdateMutationBuilder } from "@aphro/runtime-ts";
import { CreateMutationBuilder } from "@aphro/runtime-ts";
import { DeleteMutationBuilder } from "@aphro/runtime-ts";
import { makeSavable } from "@aphro/runtime-ts";
import { modelGenMemo } from "@aphro/runtime-ts";
import { Node } from "@aphro/runtime-ts";
import { NodeSpecWithCreate } from "@aphro/runtime-ts";
import { SID_of } from "@aphro/runtime-ts";
import SlideQuery from "./SlideQuery.js";
import { Context } from "@aphro/runtime-ts";
import ComponentQuery from "./ComponentQuery.js";
import Component from "../Component.js";
import Deck from "../Deck.js";
import SlideMutations from "./SlideMutations.js";
import { InstancedMutations } from "./SlideMutations.js";

declare type Muts = typeof SlideMutations;
declare type IMuts = InstancedMutations;

export type Data = {
  id: SID_of<Slide>;
  deckId: SID_of<Deck>;
  order: number;
};

// @Sealed(Slide)
export default abstract class SlideBase extends Node<Data> {
  readonly spec = s as unknown as NodeSpecWithCreate<this, Data>;

  static get mutations(): Muts {
    return SlideMutations;
  }

  get mutations(): IMuts {
    return new InstancedMutations(this as any);
  }

  get id(): SID_of<this> {
    return this.data.id as unknown as SID_of<this>;
  }

  get deckId(): SID_of<Deck> {
    return this.data.deckId;
  }

  get order(): number {
    return this.data.order;
  }

  queryComponents(): ComponentQuery {
    return ComponentQuery.create(this.ctx).whereSlideId(
      P.equals(this.id as any)
    );
  }

  static queryAll(ctx: Context): SlideQuery {
    return SlideQuery.create(ctx);
  }

  static genx = modelGenMemo(
    "example",
    "slide",
    (ctx: Context, id: SID_of<Slide>): Promise<Slide> =>
      this.queryAll(ctx).whereId(P.equals(id)).genxOnlyValue()
  );

  static gen = modelGenMemo<Slide, Slide | null>(
    "example",
    "slide",
    (ctx: Context, id: SID_of<Slide>): Promise<Slide | null> =>
      this.queryAll(ctx).whereId(P.equals(id)).genOnlyValue()
  );
}
