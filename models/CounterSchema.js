const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the counter
const CounterSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    sequence_value: {
        type: Number,
        required: true
    }
});

// Create a model based on the schema
const Counter = mongoose.model('Counter', CounterSchema);

async function getNextSequenceValues(sequenceName, count) {
  const counter = await Counter.findByIdAndUpdate(
      { _id: sequenceName },
      { $inc: { sequence_value: count } },
      { new: true, upsert: true }
  );

  const startValue = counter.sequence_value - count + 1;
  const endValue = counter.sequence_value;

  return { startValue, endValue };
}

module.exports = {getNextSequenceValues};
