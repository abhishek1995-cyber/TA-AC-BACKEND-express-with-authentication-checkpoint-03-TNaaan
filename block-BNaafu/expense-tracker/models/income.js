var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var incomeSchema = new Schema(
    {
        source: [ String],
        amount: { type: Number },
        date: { type: Date, default: Date() },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        income: { type: Number },
        type: { type: String, default: 'Income' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Income', incomeSchema);