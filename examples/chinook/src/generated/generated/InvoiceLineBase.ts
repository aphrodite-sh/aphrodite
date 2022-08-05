// SIGNED-SOURCE: <9a2d507d425fa7d33f83bc695c94fc34>
/**
 * AUTO-GENERATED FILE
 * Do not modify. Update your schema and re-generate for changes.
 */
import InvoiceLine from "../InvoiceLine.js";
import { default as s } from "./InvoiceLineSpec.js";
import { P } from "@aphro/runtime-ts";
import { UpdateMutationBuilder } from "@aphro/runtime-ts";
import { CreateMutationBuilder } from "@aphro/runtime-ts";
import { DeleteMutationBuilder } from "@aphro/runtime-ts";
import { modelGenMemo } from "@aphro/runtime-ts";
import { Node } from "@aphro/runtime-ts";
import { NodeSpecWithCreate } from "@aphro/runtime-ts";
import { SID_of } from "@aphro/runtime-ts";
import InvoiceLineQuery from "./InvoiceLineQuery.js";
import { Context } from "@aphro/runtime-ts";
import TrackQuery from "./TrackQuery.js";
import TrackSpec from "./TrackSpec.js";
import InvoiceQuery from "./InvoiceQuery.js";
import InvoiceSpec from "./InvoiceSpec.js";
import Invoice from "../Invoice.js";
import Track from "../Track.js";

export type Data = {
  id: SID_of<InvoiceLine>;
  invoiceId: SID_of<Invoice>;
  trackId: SID_of<Track>;
  unitPrice: number;
  quantity: number;
};

// @Sealed(InvoiceLine)
export default abstract class InvoiceLineBase extends Node<Data> {
  readonly spec = s as unknown as NodeSpecWithCreate<this, Data>;

  get id(): SID_of<this> {
    return this.data.id as unknown as SID_of<this>;
  }

  get invoiceId(): SID_of<Invoice> {
    return this.data.invoiceId;
  }

  get trackId(): SID_of<Track> {
    return this.data.trackId;
  }

  get unitPrice(): number {
    return this.data.unitPrice;
  }

  get quantity(): number {
    return this.data.quantity;
  }

  queryTrack(): TrackQuery {
    return TrackQuery.fromId(this.ctx, this.trackId);
  }
  queryInvoice(): InvoiceQuery {
    return InvoiceQuery.fromId(this.ctx, this.invoiceId);
  }

  async genTrack(): Promise<Track> {
    const existing = this.ctx.cache.get(
      this.trackId,
      TrackSpec.storage.db,
      TrackSpec.storage.tablish
    );
    if (existing != null) {
      return existing;
    }
    return await this.queryTrack().genxOnlyValue();
  }

  async genInvoice(): Promise<Invoice> {
    const existing = this.ctx.cache.get(
      this.invoiceId,
      InvoiceSpec.storage.db,
      InvoiceSpec.storage.tablish
    );
    if (existing != null) {
      return existing;
    }
    return await this.queryInvoice().genxOnlyValue();
  }

  static queryAll(ctx: Context): InvoiceLineQuery {
    return InvoiceLineQuery.create(ctx);
  }

  static genx = modelGenMemo(
    "chinook",
    "invoiceline",
    (ctx: Context, id: SID_of<InvoiceLine>): Promise<InvoiceLine> =>
      this.queryAll(ctx).whereId(P.equals(id)).genxOnlyValue()
  );

  static gen = modelGenMemo(
    "chinook",
    "invoiceline",
    (ctx: Context, id: SID_of<InvoiceLine>): Promise<InvoiceLine | null> =>
      this.queryAll(ctx).whereId(P.equals(id)).genOnlyValue()
  );

  update(data: Partial<Data>) {
    return new UpdateMutationBuilder(this.ctx, this.spec, this)
      .set(data)
      .toChangeset();
  }

  static create(ctx: Context, data: Partial<Data>) {
    return new CreateMutationBuilder(ctx, s).set(data).toChangeset();
  }

  delete() {
    return new DeleteMutationBuilder(this.ctx, this.spec, this).toChangeset();
  }
}
