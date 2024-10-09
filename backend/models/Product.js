import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    category: String,
    sold: Boolean,
    image: String
});

export default model('Product', productSchema);
