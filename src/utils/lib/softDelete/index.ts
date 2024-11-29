import { Schema } from "mongoose";

const softDeletePlugin = (schema: Schema) => {
    schema.add({
        isDeleted: { type: Boolean, default: false, q: true },
        deletedAt: { type: Date, default: null, q: true },
    });

    schema.methods.softDelete = async function () {
        this.isDeleted = true;
        this.deletedAt = new Date();
        return this.save();
    };

    schema.methods.restore = async function () {
        this.isDeleted = false;
        this.deletedAt = null;
        return this.save();
    };

    schema.statics.softDeleteById = async function (id) {
        return this.findByIdAndUpdate(
            id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
    };

    schema.statics.restoreById = async function (id) {
        return this.findByIdAndUpdate(
            id,
            { isDeleted: false, deletedAt: null },
            { new: true }
        );
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema.pre(/^find/, function <Filter extends Record<string, unknown>>(this: any, next: () => void) {
        const filter = this.getFilter() as Filter;
        if (filter.isDeleted === undefined) {
            this.where({ isDeleted: {
                $ne: true
            }});
        }

        next();
    });
};


export default softDeletePlugin;