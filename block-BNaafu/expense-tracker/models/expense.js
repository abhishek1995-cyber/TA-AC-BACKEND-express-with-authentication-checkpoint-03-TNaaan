var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseSchema = new Schema(
    {
        category: [String],
        expenseamount: { type: Number },
        expensedate: { type: Date, default: Date() },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, default: 'Expense' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);