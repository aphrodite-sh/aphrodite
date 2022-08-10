import Observable from '@strut/events';
import { Transaction } from './transaction.js';

type Node = {
  transaction: Transaction;
  next?: Node;
  prev?: Node;
};

class WeaklyObservable<T extends Object> {
  private _subscriptions: Set<WeakRef<(p: T) => void>> = new Set();

  /**
   *
   * @param c the callback to invoke
   * @returns a function to stop observing if you'd like to aggressively clean yourself up
   */
  observe(c: (p: T) => void): () => void {
    const ref = this.#makeRef(c);
    this._subscriptions.add(ref);

    // allow people to aggressively clean themselves up
    return () => this._subscriptions.delete(ref);
  }

  /**
   * make the weak reference in isolation so it does not get captured
   * by closures or other things that could be introduced to a function body.
   */
  #makeRef(c: (p: T) => void) {
    return new WeakRef(c);
  }

  protected notify(p: T) {
    for (const ref of this._subscriptions) {
      const c = ref.deref();
      if (c == null) {
        this._subscriptions.delete(ref);
        continue;
      }
      try {
        c(p);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export default class TransactionLog extends WeaklyObservable<Transaction> {
  private lastTransaction?: Node;
  private firstTransaction?: Node;
  private length: number = 0;

  constructor(private capacity: number) {
    super();
  }

  get hasTransaction() {
    return this.lastTransaction != null;
  }

  get hasNextTransaction() {
    return this.lastTransaction?.next != null;
  }

  push(tx: Transaction) {
    ++this.length;
    if (this.lastTransaction == null) {
      this.lastTransaction = this.firstTransaction = { transaction: tx };
    } else {
      const newNode = {
        transaction: tx,
        prev: this.lastTransaction,
      };
      this.lastTransaction.next = newNode;
      this.lastTransaction = newNode;
    }

    // At capacity? Drop the first TX
    if (this.length > this.capacity) {
      // The type system doesn't realize that length != 0 then firstTx != null
      this.firstTransaction = this.firstTransaction?.next;
      --this.length;
    }

    this.notify(tx);
  }
}
