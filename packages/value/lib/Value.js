import { History } from "./History.js";
import { memory } from "./memory.js";
import { PSD } from "@aphrodite.sh/context-provider";
/**
 * Value is the primitive building block to creating ACI memory. Value can hold anything.
 * If you put complex types into value those types should be immutable.
 */
export class Value {
    data;
    history = new History();
    memVers = memory.nextVersion();
    constructor(data) {
        this.data = data;
    }
    /**
     * Reads the current value. If a transaction is provided this method will return
     * the value as seen through transaction isolation.
     * @param tx
     * @returns
     */
    get() {
        // TODO:
        // @ts-ignore
        const tx = PSD.tx;
        if (!tx) {
            return this.data;
        }
        if (tx.touched.has(this)) {
            return tx.touched.get(this);
        }
        // Now check based on memory version.
        if (this.memVers <= tx.memoryVersion) {
            // data is the latest data for this value.
            // if the latest data for the value is not newer than when
            // the transaction started then the transaction can receive it.
            this.history.drop();
            return this.data;
        }
        // if the latest data is newer than the transaction then someone wrote
        // the value while the transaction was running.
        // To preserve tx isolation we must go back into history to
        // return the value that was set when the current tx started
        return this.history.at(tx.memoryVersion);
    }
    /**
     * Sets the value. If a transaction is not provided the value
     * is set and committed. If a transaction is provided, the value is only
     * set from the perspective of that transaction. Once the transaction
     * is committed the value will be visible outside the transaction.
     * @param data
     * @param tx
     * @returns
     */
    set(data) {
        // @ts-ignore
        const tx = PSD.tx;
        if (!tx) {
            this.__commit(data);
            this.__transactionComplete();
            return;
        }
        tx.touched.set(this, data);
    }
    /**
     * Commit the change. Should only be called by
     * transaction logic and not end users.
     */
    __commit(data) {
        this.history.maybeAdd(this.data, this.memVers);
        this.data = data;
        this.memVers = memory.nextVersion();
    }
    __transactionComplete() { }
}
export function value(data) {
    const ret = new Value(data);
    // @ts-ignore
    const tx = PSD.tx;
    if (tx) {
        tx.touched.set(ret, data);
    }
    return ret;
}
// TODO: read up on how sqlite provides guarantees:
// https://www.sqlite.org/lang_transaction.html
//# sourceMappingURL=Value.js.map