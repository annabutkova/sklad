import mongoose from 'mongoose';

// Строка подключения из MongoDB Atlas (замените на свою)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://annabutkova94:ejscdESlN59YDvLY@ms-dev.2myqeye.mongodb.net/';

// Проверка, что строка подключения установлена
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// Кэширование соединения в режиме разработки
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Функция для подключения к базе данных
async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDatabase;